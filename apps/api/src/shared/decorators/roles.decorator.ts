// apps/api/src/shared/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { RoleName } from '../types/jwt-payload.type';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: RoleName[]) => SetMetadata(ROLES_KEY, roles);
