// apps/api/src/modules/auth/application/auth.service.ts
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../../db/prisma.service';
import { AuthTokens, JwtPayload, RoleName } from '../domain/auth.types';
import { RefreshTokenRepository } from '../infrastructure/refresh-token.repository';
import { FirebaseAdminService } from '../infrastructure/firebase-admin.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly refreshTokens: RefreshTokenRepository,
    private readonly firebaseAdmin: FirebaseAdminService,
  ) {}

  async staffLogin(email: string, password: string): Promise<AuthTokens> {
    const user = await this.prisma.user.findFirst({
      where: { email, deletedAt: null, isActive: true },
      include: {
        clinicUsers: {
          where: { isActive: true },
          include: { role: true },
        },
      },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const primary = user.clinicUsers[0];
    if (!primary && !user.isSuperAdmin) {
      throw new UnauthorizedException('User has no active clinic membership');
    }

    return this.issueTokens(this.buildStaffPayload(user));
  }

  async patientLogin(idToken: string): Promise<AuthTokens> {
    const decoded = await this.firebaseAdmin.verifyIdToken(idToken);

    const firebasePhone = decoded.phone_number;
    if (!firebasePhone) {
      throw new UnauthorizedException('Firebase token does not contain a phone number');
    }

    // Normalise: Firebase always returns E.164 (+91XXXXXXXXXX), DB stores 10-digit local
    const localPhone = firebasePhone.replace(/^\+91/, '');

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ phone: firebasePhone }, { phone: localPhone }],
        deletedAt: null,
        isActive: true,
      },
      include: { patient: true },
    });

    if (!user) {
      throw new NotFoundException(
        'No registered patient found for this phone number. Please contact the clinic to register first.',
      );
    }

    if (!user.patient) {
      throw new UnauthorizedException('This account is not registered as a patient.');
    }

    // Bind Firebase UID to user row if not already set
    if (!user.firebaseUid) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { firebaseUid: decoded.uid },
      });
    }

    return this.issueTokens(this.buildPatientPayload(user, user.patient));
  }

  async logout(token: string): Promise<void> {
    const existing = await this.refreshTokens.findActive(token);
    if (existing) {
      await this.refreshTokens.revoke(existing.id);
    }
  }

  async refresh(token: string): Promise<AuthTokens> {
    const existing = await this.refreshTokens.findActive(token);
    if (!existing) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.prisma.user.findFirst({
      where: { id: existing.userId, deletedAt: null, isActive: true },
      include: {
        clinicUsers: {
          where: { isActive: true },
          include: { role: true },
        },
        patient: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    await this.refreshTokens.revoke(existing.id);

    const payload = user.patient
      ? this.buildPatientPayload(user, user.patient)
      : this.buildStaffPayload(user);

    return this.issueTokens(payload);
  }

  private buildStaffPayload(user: {
    id: string;
    isSuperAdmin: boolean;
    clinicUsers: Array<{ clinicId: string; role: { name: string } }>;
  }): JwtPayload {
    const primary = user.clinicUsers[0];
    return {
      sub: user.id,
      clinicId: primary?.clinicId ?? null,
      roles: user.clinicUsers.map((cu) => cu.role.name as RoleName),
      isSuperAdmin: user.isSuperAdmin,
      isPatient: false,
      patientId: null,
    };
  }

  private buildPatientPayload(
    user: { id: string },
    patient: { id: string; clinicId: string },
  ): JwtPayload {
    return {
      sub: user.id,
      clinicId: patient.clinicId,
      roles: [],
      isSuperAdmin: false,
      isPatient: true,
      patientId: patient.id,
    };
  }

  private async issueTokens(payload: JwtPayload): Promise<AuthTokens> {
    const accessSecret = this.config.getOrThrow<string>('JWT_ACCESS_SECRET');
    const accessTtl = this.config.get<string>('JWT_ACCESS_TTL', '15m');
    const refreshTtl = this.config.get<string>('JWT_REFRESH_TTL', '7d');

    const accessToken = await this.jwt.signAsync(payload, {
      secret: accessSecret,
      expiresIn: Math.floor(this.ttlToMs(accessTtl) / 1000),
    });

    const refreshToken = this.refreshTokens.generate();
    const expiresAt = new Date(Date.now() + this.ttlToMs(refreshTtl));
    await this.refreshTokens.store(payload.sub, refreshToken, expiresAt);

    return { accessToken, refreshToken };
  }

  private ttlToMs(ttl: string): number {
    const match = ttl.match(/^(\d+)([smhd])$/);
    if (!match) return 7 * 24 * 60 * 60 * 1000;
    const value = parseInt(match[1], 10);
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };
    return value * (multipliers[match[2]] ?? 24 * 60 * 60 * 1000);
  }
}
