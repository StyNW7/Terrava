import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { AppConfigService } from '../../config/app-config.service';
import type { AuthContext, JwtPayload } from '../../common/auth-context';

/**
 * Validates the access token and confirms its session is still live, so
 * "sign out" and "revoke session" take effect immediately rather than when the
 * 15-minute token expires.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: AppConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_ACCESS_SECRET'),
      issuer: 'terrava-api',
      audience: 'terrava-dashboard',
    });
  }

  async validate(payload: JwtPayload): Promise<AuthContext> {
    const session = await this.prisma.session.findUnique({
      where: { id: payload.sid },
      select: {
        revokedAt: true,
        expiresAt: true,
        user: { select: { status: true, name: true, email: true } },
      },
    });
    if (!session || session.revokedAt || session.expiresAt < new Date() || session.user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Session is no longer valid');
    }
    const membership = await this.prisma.membership.findUnique({
      where: { id: payload.mid },
      select: { role: true, status: true },
    });
    if (!membership || membership.status !== 'ACTIVE')
      throw new UnauthorizedException('Membership is no longer active');

    return {
      userId: payload.sub,
      organizationId: payload.org,
      membershipId: payload.mid,
      sessionId: payload.sid,
      // Use the live role so a role change applies without waiting for a new token.
      role: membership.role,
      name: session.user.name,
      email: session.user.email,
    };
  }
}
