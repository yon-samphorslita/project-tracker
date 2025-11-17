import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums/role.enum';
import { ROLES_KEY } from './roles.decorator';
import { IS_PUBLIC_KEY } from './public.decorator';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Injectable()
export class JwtRoleGuard extends AuthGuard('jwt') implements CanActivate {
  constructor(private reflector: Reflector, private authService: AuthService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Skip public routes
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    // Verify the JwtStrategy to verify token
    const canActivate = (
      await super.canActivate(context)
    ) as boolean;
    if (!canActivate) return false;

    const request = context.switchToHttp().getRequest();
    const token = request.headers['authorization']?.split(' ')[1]

    if (this.authService.isTokenBlacklisted(token)) {
      throw new UnauthorizedException('Token has been revoked')
    }
    // Check roles
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const user = context.switchToHttp().getRequest().user;
    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        `Access denied. Required roles: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
