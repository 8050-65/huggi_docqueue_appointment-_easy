// apps/api/src/modules/doctors/infrastructure/doctor.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../db/prisma.service';

@Injectable()
export class DoctorRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(doctorId: string) {
    return this.prisma.doctor.findFirst({
      where: { id: doctorId },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.doctor.findFirst({
      where: { userId },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
    });
  }

  async findByClinicId(clinicId: string) {
    return this.prisma.doctor.findMany({
      where: { clinicId },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: {
    userId: string;
    clinicId: string;
    specialization?: string;
    consultationDuration?: number;
  }) {
    return this.prisma.doctor.create({
      data: {
        userId: data.userId,
        clinicId: data.clinicId,
        specialization: data.specialization || 'General',
        consultationDuration: data.consultationDuration || 30,
      },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
    });
  }

  async update(
    doctorId: string,
    data: Partial<{
      specialization: string;
      consultationDuration: number;
      isAvailable: boolean;
    }>,
  ) {
    return this.prisma.doctor.update({
      where: { id: doctorId },
      data,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
    });
  }

  async delete(doctorId: string) {
    return this.prisma.doctor.delete({
      where: { id: doctorId },
    });
  }
}
