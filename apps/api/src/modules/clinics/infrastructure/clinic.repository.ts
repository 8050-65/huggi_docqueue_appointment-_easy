// apps/api/src/modules/clinics/infrastructure/clinic.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../db/prisma.service';

@Injectable()
export class ClinicRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(clinicId: string) {
    return this.prisma.clinic.findFirst({
      where: { id: clinicId, deletedAt: null },
      include: {
        clinicUsers: {
          where: { isActive: true },
          include: { user: { select: { id: true, email: true, name: true } }, role: true },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.clinic.findMany({
      where: { deletedAt: null, isActive: true },
      include: {
        clinicUsers: {
          where: { isActive: true },
          include: { user: { select: { id: true, email: true, name: true } }, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: { name: string; address: string; phone: string }) {
    return this.prisma.clinic.create({
      data,
      include: {
        clinicUsers: {
          include: { user: { select: { id: true, email: true, name: true } }, role: true },
        },
      },
    });
  }

  async update(clinicId: string, data: Partial<{ name: string; address: string; phone: string }>) {
    return this.prisma.clinic.update({
      where: { id: clinicId },
      data,
      include: {
        clinicUsers: {
          where: { isActive: true },
          include: { user: { select: { id: true, email: true, name: true } }, role: true },
        },
      },
    });
  }

  async softDelete(clinicId: string) {
    return this.prisma.clinic.update({
      where: { id: clinicId },
      data: { deletedAt: new Date() },
    });
  }
}
