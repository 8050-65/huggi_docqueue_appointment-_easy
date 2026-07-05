// apps/api/src/modules/patients/infrastructure/patient.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../db/prisma.service';

@Injectable()
export class PatientRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(patientId: string) {
    return this.prisma.patient.findFirst({
      where: { id: patientId },
      include: {
        user: { select: { id: true, name: true, phone: true, email: true } },
      },
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.patient.findFirst({
      where: { userId },
      include: {
        user: { select: { id: true, name: true, phone: true, email: true } },
      },
    });
  }

  async findByPhone(phone: string) {
    return this.prisma.patient.findFirst({
      where: { user: { phone } },
      include: {
        user: { select: { id: true, name: true, phone: true, email: true } },
      },
    });
  }

  async findByClinicId(clinicId: string) {
    return this.prisma.patient.findMany({
      where: { clinicId, isActive: true },
      include: {
        user: { select: { id: true, name: true, phone: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createWithUser(data: { name: string; phone: string; clinicId: string; notes?: string }) {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: data.name,
          phone: data.phone,
          isActive: true,
        },
      });

      return tx.patient.create({
        data: {
          userId: user.id,
          clinicId: data.clinicId,
          notes: data.notes,
          isActive: true,
        },
        include: {
          user: { select: { id: true, name: true, phone: true, email: true } },
        },
      });
    });
  }

  async update(
    patientId: string,
    data: Partial<{
      notes: string;
      isActive: boolean;
    }>,
  ) {
    return this.prisma.patient.update({
      where: { id: patientId },
      data,
      include: {
        user: { select: { id: true, name: true, phone: true, email: true } },
      },
    });
  }

  async delete(patientId: string) {
    return this.prisma.patient.update({
      where: { id: patientId },
      data: { isActive: false },
    });
  }
}
