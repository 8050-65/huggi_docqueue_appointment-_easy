// apps/api/src/shared/types/jwt-payload.type.ts
// Re-export from auth domain so guards can import without circular deps.
export type { JwtPayload, RoleName } from '../../modules/auth/domain/auth.types';
