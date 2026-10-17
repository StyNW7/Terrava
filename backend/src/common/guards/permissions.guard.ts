import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY, PERMISSIONS_KEY } from '../decorators';
import { hasPermission, Permission } from '../permissions';
import type { AuthContext } from '../auth-context';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const targets = [context.getHandler(), context.getClass()];
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, targets)) return true;

    const required = this.reflector.getAllAndOverride<Permission[]>(PERMISSIONS_KEY, targets);
    if (!required?.length) return true;

    const user = context.switchToHttp().getRequest().user as AuthContext | undefined;
    if (!user) return false;

    const missing = required.filter((permission) => !hasPermission(user.role, permission));
    if (missing.length) {
      throw new ForbiddenException(`Your role does not allow this action (${missing.join(', ')})`);
    }
    return true;
  }
}
