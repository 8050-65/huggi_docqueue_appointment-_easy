// apps/api/src/shared/guards/roles.guard.ts
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { JwtPayload, RoleName } from '../types/jwt-payload.type';

interface AuthRequest extends Request {
  user?: JwtPayload;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<RoleName[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!required || required.length === 0) return true;

    const request = context.switchToHttp().getRequest<AuthRequest>();
    const user: JwtPayload | undefined = request.user;

    if (!user) throw new ForbiddenException('No user in request');

    if (user.isSuperAdmin) return true;

    const hasRole = required.some((r) => user.roles.includes(r));
    if (!hasRole) throw new ForbiddenException('Insufficient role');

    return true;
  }
}
