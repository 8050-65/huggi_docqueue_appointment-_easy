// packages/types/index.ts
// Shared TypeScript contracts between Huggi API (NestJS) and Web (Next.js).
// All API request/response shapes are defined here.

/**
 * Clinic — tenant root.
 * One Clinic row exists per onboarded customer.
 * All tenant-owned data references clinic.id via clinic_id.
 */
export interface Clinic {
  id: string;
  name: string;
  address: string;
  phone: string;
  configJson: Record<string, unknown>;
  isActive: boolean;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

/**
 * RoleName — fixed catalog of Huggi hospital staff roles.
 * PATIENT identity is determined by isPatient flag in JwtPayload, not a role.
 */
export type RoleName =
  | 'SUPER_ADMIN'
  | 'CLINIC_ADMIN'
  | 'RECEPTIONIST'
  | 'NURSE'
  | 'DOCTOR'
  | 'CARE_TAKER'
  | 'SECURITY'
  | 'BILLING_STAFF';

export interface Role {
  id: string;
  name: RoleName;
  description: string | null;
}

/**
 * User — global identity.
 * Patients authenticate via Firebase OTP (firebaseUid set).
 * Staff authenticate via email + password.
 * Super admins identified by isSuperAdmin.
 */
export interface User {
  id: string;
  phone: string | null;
  email: string | null;
  name: string;
  isSuperAdmin: boolean;
  isActive: boolean;
  consentGivenAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClinicUser {
  id: string;
  userId: string;
  clinicId: string;
  roleId: string;
  roleName: RoleName;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * JwtPayload — payload encoded inside Huggi access tokens.
 * isPatient + patientId are set for patient tokens issued after Firebase OTP login.
 * Staff tokens have isPatient: false, patientId: null.
 */
export interface JwtPayload {
  sub: string;
  clinicId: string | null;
  roles: RoleName[];
  isSuperAdmin: boolean;
  isPatient: boolean;
  patientId: string | null;
}

/**
 * AuthTokens — what every login/refresh endpoint returns.
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * ClinicWithUsers — Clinic including staff/users + roles.
 * Returned by clinic detail endpoint.
 */
export interface ClinicWithUsers extends Clinic {
  clinicUsers: Array<{
    id: string;
    user: { id: string; email: string | null; name: string };
    role: Role;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
}
