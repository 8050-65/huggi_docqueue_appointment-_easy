// apps/api/src/modules/appointments/infrastructure/appointment.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../db/prisma.service';

@Injectable()
export class AppointmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(appointmentId: string) {
    return this.prisma.appointment.findFirst({
      where: { id: appointmentId },
    });
  }

  async findByClinicId(clinicId: string) {
    return this.prisma.appointment.findMany({
      where: { clinicId },
      orderBy: { appointmentTime: 'desc' },
    });
  }

  async findByPatientIdAndClinicId(patientId: string, clinicId: string) {
    return this.prisma.appointment.findMany({
      where: { patientId, clinicId },
      orderBy: { appointmentTime: 'desc' },
    });
  }

  async findMineForPatient(patientId: string, clinicId: string) {
    return this.prisma.appointment.findMany({
      where: { patientId, clinicId },
      orderBy: { appointmentTime: 'desc' },
      include: {
        doctor: {
          include: { user: { select: { id: true, name: true } } },
          select: { id: true, specialization: true, consultationDuration: true, user: true },
        },
      },
    });
  }

  async findByDoctorIdAndClinicId(doctorId: string, clinicId: string) {
    return this.prisma.appointment.findMany({
      where: { doctorId, clinicId },
      orderBy: { appointmentTime: 'asc' },
    });
  }

  async findActiveConflict(doctorId: string, appointmentTime: Date) {
    return this.prisma.appointment.findFirst({
      where: {
        doctorId,
        appointmentTime,
        status: { notIn: ['cancelled', 'no_show'] },
      },
    });
  }

  async create(data: {
    clinicId: string;
    patientId: string;
    doctorId: string;
    appointmentTime: Date;
    notes?: string;
  }) {
    return this.prisma.appointment.create({
      data: {
        ...data,
        status: 'booked',
      },
    });
  }

  async update(
    appointmentId: string,
    data: Partial<{
      appointmentTime: Date;
      status: string;
      notes: string;
    }>,
  ) {
    return this.prisma.appointment.update({
      where: { id: appointmentId },
      data,
    });
  }

  async delete(appointmentId: string) {
    return this.prisma.appointment.delete({
      where: { id: appointmentId },
    });
  }
}
