// apps/api/src/modules/auth/domain/auth.types.ts
// Pure domain types — no framework dependencies.

export type RoleName =
  | 'SUPER_ADMIN'
  | 'CLINIC_ADMIN'
  | 'RECEPTIONIST'
  | 'NURSE'
  | 'DOCTOR'
  | 'CARE_TAKER'
  | 'SECURITY'
  | 'BILLING_STAFF';

export interface JwtPayload {
  sub: string;
  clinicId: string | null;
  roles: RoleName[];
  isSuperAdmin: boolean;
  isPatient: boolean;
  patientId: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
