import { applyDecorators, createParamDecorator, ExecutionContext, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiSecurity } from '@nestjs/swagger';
import type { AuthContext, DeviceContext } from '../auth-context';
import type { Permission } from '../permissions';
import { DeviceApiKeyGuard } from '../guards/device-api-key.guard';

export const IS_PUBLIC_KEY = 'isPublic';
export const PERMISSIONS_KEY = 'permissions';

/** Skip JWT authentication for a route (login, register, contact form, health...). */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/** Require every listed permission for the caller's membership role. */
export const RequirePermissions = (...permissions: Permission[]) => SetMetadata(PERMISSIONS_KEY, permissions);

/** Inject the authenticated user context into a controller handler. */
export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): AuthContext => {
  return ctx.switchToHttp().getRequest().user as AuthContext;
});

/** Inject the authenticated gateway context (device API key routes). */
export const CurrentGateway = createParamDecorator((_data: unknown, ctx: ExecutionContext): DeviceContext => {
  return ctx.switchToHttp().getRequest().gateway as DeviceContext;
});

/** Authenticate with a gateway API key (x-device-key header) instead of a user JWT. */
export const DeviceAuth = () =>
  applyDecorators(
    Public(),
    UseGuards(DeviceApiKeyGuard),
    ApiSecurity('device-key'),
    ApiHeader({ name: 'x-device-key', description: 'Gateway API key issued from the Devices module', required: true }),
  );
