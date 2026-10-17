import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { AppConfigService } from '../../config/app-config.service';
import { AuditService } from '../audit/audit.service';
import { MailService } from '../notifications/channels/mail.service';
import { permissionsFor } from '../../common/permissions';
import { randomToken, sha256 } from '../../common/utils/crypto';
import { roleLabel } from '../../common/utils/enums';
import type { JwtPayload } from '../../common/auth-context';
import type { Membership, OrganizationType, Organization, User } from '../../generated/prisma/client';
import { preferencesSchema } from '../settings/settings.schema';
import type { AcceptInvitationDto, LoginDto, RegisterDto } from './dto/auth.dto';
import { describeUserAgent, initials } from './auth.utils';

export interface RequestMeta {
  userAgent?: string;
  ipAddress?: string;
}

const BCRYPT_ROUNDS = 11;
const RESET_TTL_MINUTES = 30;
/** Compared against when the email is unknown so response time does not reveal which accounts exist. */
const DUMMY_HASH = bcrypt.hashSync('terrava-timing-guard', BCRYPT_ROUNDS);

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

function organizationTypeFor(farmType: string, accountRole: string): OrganizationType {
  const value = `${farmType} ${accountRole}`.toLowerCase();
  if (value.includes('cooperative') || value.includes('koperasi')) return 'COOPERATIVE';
  if (value.includes('government') || value.includes('pemerintah') || value.includes('institution'))
    return 'GOVERNMENT';
  if (value.includes('commercial') || value.includes('komersial')) return 'COMMERCIAL';
  return 'SMALLHOLDER';
}

/**
 * Authentication with short-lived JWT access tokens and rotating opaque refresh
 * tokens. Each refresh token belongs to a Session row; presenting an already
 * rotated token revokes every session of that user (token theft detection).
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: AppConfigService,
    private readonly audit: AuditService,
    private readonly mail: MailService,
  ) {}

  // ---------------------------------------------------------------------------
  // Registration and login
  // ---------------------------------------------------------------------------

  async register(dto: RegisterDto, meta: RequestMeta) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('An account with this email already exists');

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const preferences = preferencesSchema.parse({
      notifications: {
        whatsapp: dto.notificationMethod === 'whatsapp',
        email: dto.notificationMethod === 'email' || dto.notificationMethod !== 'whatsapp',
        weeklyReport: Boolean(dto.productUpdates),
      },
    });

    const { user, membership, organization } = await this.prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: dto.farmName,
          slug: `${slugify(dto.farmName) || 'farm'}-${randomToken(4).toLowerCase()}`,
          type: organizationTypeFor(dto.farmType, dto.accountRole),
          city: dto.city,
          province: dto.province,
        },
      });
      const user = await tx.user.create({
        data: {
          email: dto.email,
          passwordHash,
          name: dto.fullName,
          phone: dto.phone,
          locale: dto.locale ?? 'id',
          preferences,
        },
      });
      const membership = await tx.membership.create({
        data: { userId: user.id, organizationId: organization.id, role: 'OWNER', title: dto.accountRole },
      });
      // Every new account starts with one farm and one barn so the dashboard is usable immediately.
      const farm = await tx.farm.create({
        data: {
          organizationId: organization.id,
          name: dto.farmName,
          location: `${dto.city}, ${dto.province}`,
          region: dto.province,
          managerId: membership.id,
        },
      });
      await tx.barn.create({ data: { farmId: farm.id, name: 'Barn A', capacity: 20, managerId: membership.id } });
      return { user, membership, organization };
    });

    await this.audit.record(
      { organizationId: organization.id, userId: user.id, name: user.name },
      { action: 'auth.register', entityType: 'User', entityId: user.id, ipAddress: meta.ipAddress },
    );
    void this.mail.send({
      to: user.email,
      subject: 'Selamat datang di Terrava / Welcome to Terrava',
      text: `Halo ${user.name}, akun Terrava untuk ${organization.name} sudah aktif.`,
      html: MailService.layout(
        `Selamat datang, ${user.name}!`,
        `<p>Akun Terrava untuk <b>${organization.name}</b> sudah aktif. Mulai dengan menambahkan ternak dan memasangkan smart ear tag.</p>`,
        { label: 'Buka Dashboard', url: `${this.config.get('APP_URL')}/dashboard` },
      ),
    });

    return this.issueSession(user, membership, organization, { rememberMe: false, ...meta });
  }

  async login(dto: LoginDto, meta: RequestMeta) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        memberships: { where: { status: 'ACTIVE' }, include: { organization: true }, orderBy: { createdAt: 'asc' } },
      },
    });
    // Compare against a dummy hash when the user does not exist to keep timing uniform.
    const valid = await bcrypt.compare(dto.password, user?.passwordHash ?? DUMMY_HASH);
    if (!user || !valid) throw new UnauthorizedException('Invalid email or password');
    if (user.status === 'DISABLED') throw new ForbiddenException('This account has been deactivated');

    const membership = dto.organizationId
      ? user.memberships.find((m) => m.organizationId === dto.organizationId)
      : user.memberships[0];
    if (!membership) throw new ForbiddenException('This account is not a member of any active organization');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date(), lastActiveAt: new Date() },
    });
    await this.audit.record(
      { organizationId: membership.organizationId, userId: user.id, name: user.name },
      { action: 'auth.login', entityType: 'User', entityId: user.id, ipAddress: meta.ipAddress },
    );
    return this.issueSession(user, membership, membership.organization, {
      rememberMe: Boolean(dto.rememberMe),
      ...meta,
    });
  }

  async switchOrganization(userId: string, currentSessionId: string, organizationId: string, meta: RequestMeta) {
    const membership = await this.prisma.membership.findFirst({
      where: { userId, organizationId, status: 'ACTIVE' },
      include: { user: true, organization: true },
    });
    if (!membership) throw new ForbiddenException('You are not a member of that organization');
    await this.prisma.session.update({ where: { id: currentSessionId }, data: { revokedAt: new Date() } });
    return this.issueSession(membership.user, membership, membership.organization, { rememberMe: false, ...meta });
  }

  // ---------------------------------------------------------------------------
  // Tokens
  // ---------------------------------------------------------------------------

  async refresh(refreshToken: string, meta: RequestMeta) {
    const [sessionId, secret] = refreshToken.split('.');
    if (!sessionId || !secret) throw new UnauthorizedException('Malformed refresh token');

    const session = await this.prisma.session.findUnique({ where: { id: sessionId } });
    if (!session || session.expiresAt < new Date())
      throw new UnauthorizedException('Session expired, please sign in again');

    if (session.revokedAt || session.refreshTokenHash !== sha256(secret)) {
      // A rotated or revoked token was replayed: assume theft and end every session.
      await this.prisma.session.updateMany({
        where: { userId: session.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      this.logger.warn(`Refresh token reuse detected for user ${session.userId}; all sessions revoked`);
      throw new UnauthorizedException('Session is no longer valid, please sign in again');
    }

    const membership = await this.prisma.membership.findFirst({
      where: { userId: session.userId, organizationId: session.organizationId, status: 'ACTIVE' },
      include: { user: true, organization: true },
    });
    if (!membership || membership.user.status !== 'ACTIVE')
      throw new UnauthorizedException('Account is no longer active');

    const nextSecret = randomToken(48);
    await this.prisma.session.update({
      where: { id: session.id },
      data: {
        refreshTokenHash: sha256(nextSecret),
        lastUsedAt: new Date(),
        userAgent: meta.userAgent ?? session.userAgent,
        ipAddress: meta.ipAddress ?? session.ipAddress,
      },
    });
    await this.prisma.user.update({ where: { id: membership.userId }, data: { lastActiveAt: new Date() } });

    return this.buildAuthResponse(
      membership.user,
      membership,
      membership.organization,
      session.id,
      `${session.id}.${nextSecret}`,
    );
  }

  async logout(sessionId: string) {
    await this.prisma.session.updateMany({
      where: { id: sessionId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { ok: true };
  }

  async listSessions(userId: string, currentSessionId: string) {
    const sessions = await this.prisma.session.findMany({
      where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { lastUsedAt: 'desc' },
    });
    return sessions.map((session) => ({
      id: session.id,
      device: describeUserAgent(session.userAgent),
      location: session.ipAddress ?? '-',
      lastActive: session.lastUsedAt.toISOString(),
      current: session.id === currentSessionId,
    }));
  }

  async revokeSession(userId: string, sessionId: string) {
    await this.prisma.session.updateMany({
      where: { id: sessionId, userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { ok: true };
  }

  async revokeOtherSessions(userId: string, currentSessionId: string) {
    const result = await this.prisma.session.updateMany({
      where: { userId, revokedAt: null, NOT: { id: currentSessionId } },
      data: { revokedAt: new Date() },
    });
    return { revoked: result.count };
  }

  // ---------------------------------------------------------------------------
  // Passwords
  // ---------------------------------------------------------------------------

  /** Always resolves the same way so the endpoint cannot be used to discover accounts. */
  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && user.status !== 'DISABLED') {
      const token = randomToken(32);
      await this.prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash: sha256(token),
          expiresAt: new Date(Date.now() + RESET_TTL_MINUTES * 60_000),
        },
      });
      const url = `${this.config.get('APP_URL')}/reset-password?token=${token}`;
      await this.mail.send({
        to: user.email,
        subject: 'Atur ulang kata sandi Terrava',
        text: `Gunakan tautan ini dalam ${RESET_TTL_MINUTES} menit untuk mengatur ulang kata sandi: ${url}`,
        html: MailService.layout(
          'Atur ulang kata sandi',
          `<p>Kami menerima permintaan untuk mengatur ulang kata sandi akun Terrava Anda. Tautan berlaku ${RESET_TTL_MINUTES} menit.</p>`,
          { label: 'Atur ulang kata sandi', url },
        ),
      });
    }
    return { ok: true, message: 'If the email is registered, a reset link has been sent.' };
  }

  async resetPassword(token: string, password: string) {
    const record = await this.prisma.passwordResetToken.findUnique({ where: { tokenHash: sha256(token) } });
    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw new BadRequestException('This reset link is invalid or has expired');
    }
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
      this.prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
      // Changing the password signs the user out everywhere.
      this.prisma.session.updateMany({
        where: { userId: record.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
    return { ok: true };
  }

  async changePassword(userId: string, currentSessionId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
      throw new BadRequestException('Current password is incorrect');
    }
    if (currentPassword === newPassword) throw new BadRequestException('The new password must be different');
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: await bcrypt.hash(newPassword, BCRYPT_ROUNDS) },
    });
    await this.revokeOtherSessions(userId, currentSessionId);
    return { ok: true };
  }

  // ---------------------------------------------------------------------------
  // Invitations
  // ---------------------------------------------------------------------------

  async acceptInvitation(dto: AcceptInvitationDto, meta: RequestMeta) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { tokenHash: sha256(dto.token) },
      include: { organization: true },
    });
    if (!invitation || invitation.acceptedAt || invitation.revokedAt || invitation.expiresAt < new Date()) {
      throw new BadRequestException('This invitation is invalid or has expired');
    }

    let user = await this.prisma.user.findUnique({ where: { email: invitation.email } });
    if (!user) {
      if (!dto.name || !dto.password)
        throw new BadRequestException('Name and password are required to create your account');
      user = await this.prisma.user.create({
        data: { email: invitation.email, name: dto.name, passwordHash: await bcrypt.hash(dto.password, BCRYPT_ROUNDS) },
      });
    } else if (user.status === 'INVITED') {
      if (!dto.password) throw new BadRequestException('Choose a password to activate your account');
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          status: 'ACTIVE',
          name: dto.name ?? user.name,
          passwordHash: await bcrypt.hash(dto.password, BCRYPT_ROUNDS),
        },
      });
    }

    const membership = await this.prisma.membership.upsert({
      where: { userId_organizationId: { userId: user.id, organizationId: invitation.organizationId } },
      update: { role: invitation.role, farmId: invitation.farmId, status: 'ACTIVE' },
      create: {
        userId: user.id,
        organizationId: invitation.organizationId,
        role: invitation.role,
        farmId: invitation.farmId,
      },
    });
    await this.prisma.invitation.update({ where: { id: invitation.id }, data: { acceptedAt: new Date() } });

    return this.issueSession(user, membership, invitation.organization, { rememberMe: false, ...meta });
  }

  // ---------------------------------------------------------------------------
  // Profile
  // ---------------------------------------------------------------------------

  async me(userId: string, organizationId: string) {
    const membership = await this.prisma.membership.findFirstOrThrow({
      where: { userId, organizationId },
      include: { user: true, organization: true },
    });
    const organizations = await this.prisma.membership.findMany({
      where: { userId, status: 'ACTIVE' },
      select: { role: true, organization: { select: { id: true, name: true, type: true } } },
    });
    return {
      user: this.toAuthUser(membership.user, membership, membership.organization),
      permissions: permissionsFor(membership.role),
      organization: {
        id: membership.organization.id,
        name: membership.organization.name,
        type: membership.organization.type.toLowerCase(),
        province: membership.organization.province,
        city: membership.organization.city,
      },
      organizations: organizations.map((m) => ({
        ...m.organization,
        type: m.organization.type.toLowerCase(),
        role: roleLabel(m.role),
      })),
    };
  }

  // ---------------------------------------------------------------------------
  // Internals
  // ---------------------------------------------------------------------------

  private async issueSession(
    user: User,
    membership: Membership,
    organization: Organization,
    opts: { rememberMe: boolean } & RequestMeta,
  ) {
    const days = opts.rememberMe
      ? this.config.get('JWT_REFRESH_TTL_REMEMBER_DAYS')
      : this.config.get('JWT_REFRESH_TTL_DAYS');
    const secret = randomToken(48);
    const session = await this.prisma.session.create({
      data: {
        userId: user.id,
        organizationId: organization.id,
        refreshTokenHash: sha256(secret),
        rememberMe: opts.rememberMe,
        userAgent: opts.userAgent?.slice(0, 255),
        ipAddress: opts.ipAddress,
        expiresAt: new Date(Date.now() + days * 86_400_000),
      },
    });
    return this.buildAuthResponse(user, membership, organization, session.id, `${session.id}.${secret}`);
  }

  private async buildAuthResponse(
    user: User,
    membership: Membership,
    organization: Organization,
    sessionId: string,
    refreshToken: string,
  ) {
    const payload: JwtPayload = {
      sub: user.id,
      org: organization.id,
      mid: membership.id,
      role: membership.role,
      sid: sessionId,
    };
    const expiresIn = this.config.get('JWT_ACCESS_TTL_SECONDS');
    const accessToken = await this.jwt.signAsync(payload, { expiresIn });
    return {
      user: this.toAuthUser(user, membership, organization),
      permissions: permissionsFor(membership.role),
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn,
    };
  }

  /** Same shape as the dashboard's AuthUser type. */
  private toAuthUser(user: User, membership: Membership, organization: Organization) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: roleLabel(membership.role),
      title: membership.title,
      farmName: organization.name,
      organizationId: organization.id,
      membershipId: membership.id,
      initials: initials(user.name),
      avatarUrl: user.avatarUrl,
      locale: user.locale,
    };
  }
}
