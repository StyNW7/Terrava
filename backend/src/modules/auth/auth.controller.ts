import { Body, Controller, Delete, Get, HttpCode, Param, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { CurrentUser, Public } from '../../common/decorators';
import type { AuthContext } from '../../common/auth-context';
import { AuthService, type RequestMeta } from './auth.service';
import {
  AcceptInvitationDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  LoginDto,
  RefreshDto,
  RegisterDto,
  ResetPasswordDto,
  SwitchOrganizationDto,
} from './dto/auth.dto';

function meta(req: Request): RequestMeta {
  return { userAgent: req.headers['user-agent'], ipAddress: req.ip };
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('register')
  @ApiOperation({ summary: 'Create an account, organization, first farm and barn (3-step registration form)' })
  register(@Body() dto: RegisterDto, @Req() req: Request) {
    return this.auth.register(dto, meta(req));
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Sign in with email and password' })
  login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.auth.login(dto, meta(req));
  }

  @Public()
  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Rotate the refresh token and get a new access token' })
  refresh(@Body() dto: RefreshDto, @Req() req: Request) {
    return this.auth.refresh(dto.refreshToken, meta(req));
  }

  @ApiBearerAuth()
  @Post('logout')
  @HttpCode(200)
  logout(@CurrentUser() user: AuthContext) {
    return this.auth.logout(user.sessionId);
  }

  @Public()
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @Post('forgot-password')
  @HttpCode(200)
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.auth.forgotPassword(dto.email);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('reset-password')
  @HttpCode(200)
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.auth.resetPassword(dto.token, dto.password);
  }

  @Public()
  @Post('accept-invitation')
  @ApiOperation({ summary: 'Join an organization from an invitation link' })
  acceptInvitation(@Body() dto: AcceptInvitationDto, @Req() req: Request) {
    return this.auth.acceptInvitation(dto, meta(req));
  }

  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Current user, role, permissions and organizations' })
  me(@CurrentUser() user: AuthContext) {
    return this.auth.me(user.userId, user.organizationId);
  }

  @ApiBearerAuth()
  @Post('switch-organization')
  @HttpCode(200)
  switchOrganization(@CurrentUser() user: AuthContext, @Body() dto: SwitchOrganizationDto, @Req() req: Request) {
    return this.auth.switchOrganization(user.userId, user.sessionId, dto.organizationId, meta(req));
  }

  @ApiBearerAuth()
  @Post('change-password')
  @HttpCode(200)
  @ApiOperation({ summary: 'Settings -> Security: change password (signs out other sessions)' })
  changePassword(@CurrentUser() user: AuthContext, @Body() dto: ChangePasswordDto) {
    return this.auth.changePassword(user.userId, user.sessionId, dto.currentPassword, dto.newPassword);
  }

  @ApiBearerAuth()
  @Get('sessions')
  @ApiOperation({ summary: 'Settings -> Security: active sessions' })
  sessions(@CurrentUser() user: AuthContext) {
    return this.auth.listSessions(user.userId, user.sessionId);
  }

  @ApiBearerAuth()
  @Delete('sessions/:id')
  revokeSession(@CurrentUser() user: AuthContext, @Param('id') id: string) {
    return this.auth.revokeSession(user.userId, id);
  }

  @ApiBearerAuth()
  @Post('sessions/revoke-others')
  @HttpCode(200)
  revokeOthers(@CurrentUser() user: AuthContext) {
    return this.auth.revokeOtherSessions(user.userId, user.sessionId);
  }
}
