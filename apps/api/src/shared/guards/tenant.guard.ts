// apps/api/src/shared/guards/tenant.guard.ts
// Enforces that the authenticated user belongs to the clinic being accessed.
// Applied on routes that carry :clinicId in the path.
// Super admins bypass this check.
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { JwtPayload } from '../types/jwt-payload.type';

interface AuthRequest extends Request {
  user?: JwtPayload;
}

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const user: JwtPayload | undefined = request.user;

    if (!user) throw new ForbiddenException('No user in request');
    if (user.isSuperAdmin) return true;

    const paramClinicId = (request.params?.clinicId ?? request.body?.clinicId) as
      | string
      | undefined;
    if (typeof paramClinicId !== 'string') return true;

    if (!paramClinicId) return true;

    if (user.clinicId !== paramClinicId) {
      throw new ForbiddenException('Access denied to this clinic');
    }

    return true;
  }
}
