// apps/api/src/modules/users/infrastructure/user.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../db/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(userId: string) {
    return this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      include: {
        clinicUsers: {
          where: { isActive: true },
          include: { clinic: true, role: true },
        },
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findFirst({
      where: { email, deletedAt: null },
      include: {
        clinicUsers: {
          where: { isActive: true },
          include: { clinic: true, role: true },
        },
      },
    });
  }

  async findByClinicId(clinicId: string) {
    return this.prisma.user.findMany({
      where: {
        deletedAt: null,
        clinicUsers: { some: { clinicId, isActive: true } },
      },
      include: {
        clinicUsers: {
          where: { clinicId, isActive: true },
          include: { clinic: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    clinicId: string;
    roleId: string;
  }) {
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.password,
        name: data.name,
        phone: data.phone || null,
      },
      include: { clinicUsers: { include: { clinic: true, role: true } } },
    });

    await this.prisma.clinicUser.create({
      data: {
        userId: user.id,
        clinicId: data.clinicId,
        roleId: data.roleId,
      },
    });

    return this.findById(user.id);
  }

  async update(
    userId: string,
    data: Partial<{
      email: string;
      name: string;
      phone: string;
    }>,
  ) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      include: {
        clinicUsers: {
          where: { isActive: true },
          include: { clinic: true, role: true },
        },
      },
    });
  }

  async softDelete(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });
  }

  async deactivateClinicUser(userId: string, clinicId: string) {
    return this.prisma.clinicUser.updateMany({
      where: { userId, clinicId },
      data: { isActive: false },
    });
  }

  async findRoleByName(roleName: string) {
    return this.prisma.role.findFirst({
      where: { name: roleName },
    });
  }
}
