// apps/api/src/modules/users/application/user.service.ts
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserRepository } from '../infrastructure/user.repository';

@Injectable()
export class UserService {
  constructor(private readonly repo: UserRepository) {}

  async getByIdTenantScoped(userId: string, userClinicId: string | null, isSuperAdmin: boolean) {
    const user = await this.repo.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    if (!isSuperAdmin) {
      const hasClinicAccess = user.clinicUsers.some((cu) => cu.clinicId === userClinicId);
      if (!hasClinicAccess) {
        throw new ForbiddenException('Access denied to this user');
      }
    }

    return user;
  }

  async getByClinicIdTenantScoped(
    clinicId: string,
    userClinicId: string | null,
    isSuperAdmin: boolean,
  ) {
    if (!isSuperAdmin && userClinicId !== clinicId) {
      throw new ForbiddenException('Access denied to this clinic');
    }

    return this.repo.findByClinicId(clinicId);
  }

  async create(data: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    clinicId: string;
    role: string;
  }) {
    const existing = await this.repo.findByEmail(data.email);
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const role = await this.repo.findRoleByName(data.role);
    if (!role) {
      throw new ConflictException(`Role ${data.role} not found`);
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    return this.repo.create({
      email: data.email,
      password: passwordHash,
      name: data.name,
      phone: data.phone,
      clinicId: data.clinicId,
      roleId: role.id,
    });
  }

  async update(
    userId: string,
    data: Partial<{
      email: string;
      name: string;
      phone: string;
    }>,
  ) {
    const user = await this.repo.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    if (data.email && data.email !== user.email) {
      const existing = await this.repo.findByEmail(data.email);
      if (existing) {
        throw new ConflictException('Email already in use');
      }
    }

    return this.repo.update(userId, data);
  }

  async delete(userId: string) {
    const user = await this.repo.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    return this.repo.softDelete(userId);
  }
}
