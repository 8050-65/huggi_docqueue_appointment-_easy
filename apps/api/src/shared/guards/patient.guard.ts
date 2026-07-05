// apps/api/src/shared/guards/patient.guard.ts
// Allows only JWTs issued via patient Firebase OTP login (isPatient: true).
// Must be used after JwtAuthGuard (requires request.user to be populated).
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { JwtPayload } from '../types/jwt-payload.type';

interface AuthRequest extends Request {
  user?: JwtPayload;
}

@Injectable()
export class PatientGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const user: JwtPayload | undefined = request.user;

    if (!user) throw new ForbiddenException('No user in request');

    if (!user.isPatient) {
      throw new ForbiddenException('This endpoint is only accessible to patients');
    }

    if (!user.patientId || !user.clinicId) {
      throw new ForbiddenException('Patient profile incomplete');
    }

    return true;
  }
}
