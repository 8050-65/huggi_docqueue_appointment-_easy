// apps/api/src/modules/appointments/application/appointment.service.ts
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AppointmentRepository } from '../infrastructure/appointment.repository';
import { QueueService } from '../../queue/application/queue.service';

@Injectable()
export class AppointmentService {
  constructor(
    private readonly repo: AppointmentRepository,
    private readonly queue: QueueService,
  ) {}

  async getByIdTenantScoped(
    appointmentId: string,
    userClinicId: string | null,
    isSuperAdmin: boolean,
  ) {
    const appointment = await this.repo.findById(appointmentId);
    if (!appointment) throw new NotFoundException('Appointment not found');

    if (!isSuperAdmin && userClinicId !== appointment.clinicId) {
      throw new ForbiddenException('Access denied to this appointment');
    }

    return appointment;
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

  async getMineForPatient(patientId: string, clinicId: string) {
    return this.repo.findMineForPatient(patientId, clinicId);
  }

  async getByPatientIdTenantScoped(
    patientId: string,
    clinicId: string,
    userClinicId: string | null,
    isSuperAdmin: boolean,
  ) {
    if (!isSuperAdmin && userClinicId !== clinicId) {
      throw new ForbiddenException('Access denied to this clinic');
    }

    return this.repo.findByPatientIdAndClinicId(patientId, clinicId);
  }

  async create(data: {
    clinicId: string;
    patientId: string;
    doctorId: string;
    appointmentTime: string;
    notes?: string;
  }) {
    const appointmentTime = new Date(data.appointmentTime);
    if (appointmentTime < new Date()) {
      throw new ConflictException('Appointment time cannot be in the past');
    }

    const conflict = await this.repo.findActiveConflict(data.doctorId, appointmentTime);
    if (conflict) {
      throw new ConflictException('Doctor already has an appointment booked at this time');
    }

    const appointment = await this.repo.create({
      clinicId: data.clinicId,
      patientId: data.patientId,
      doctorId: data.doctorId,
      appointmentTime,
      notes: data.notes,
    });

    await this.queue.createForAppointment(data.clinicId, appointment.id);

    return appointment;
  }

  async update(
    appointmentId: string,
    data: Partial<{
      appointmentTime: string;
      status: string;
      notes: string;
    }>,
  ) {
    const appointment = await this.repo.findById(appointmentId);
    if (!appointment) throw new NotFoundException('Appointment not found');

    const updateData: Partial<{
      appointmentTime: Date;
      status: string;
      notes: string;
    }> = {};

    if (data.appointmentTime) {
      updateData.appointmentTime = new Date(data.appointmentTime);
    }
    if (data.status) {
      updateData.status = data.status;
    }
    if (data.notes !== undefined) {
      updateData.notes = data.notes;
    }

    return this.repo.update(appointmentId, updateData);
  }

  async cancel(appointmentId: string) {
    const appointment = await this.repo.findById(appointmentId);
    if (!appointment) throw new NotFoundException('Appointment not found');

    await this.queue.cancelByAppointmentId(appointmentId);
    return this.repo.update(appointmentId, { status: 'cancelled' });
  }

  async delete(appointmentId: string) {
    const appointment = await this.repo.findById(appointmentId);
    if (!appointment) throw new NotFoundException('Appointment not found');

    await this.queue.cancelByAppointmentId(appointmentId);
    return this.repo.delete(appointmentId);
  }
}
