// apps/api/src/modules/queue/application/queue.service.ts
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { QueueRepository } from '../infrastructure/queue.repository';

@Injectable()
export class QueueService {
  constructor(private readonly repo: QueueRepository) {}

  async getByIdTenantScoped(queueId: string, userClinicId: string | null, isSuperAdmin: boolean) {
    const queue = await this.repo.findById(queueId);
    if (!queue) throw new NotFoundException('Queue entry not found');

    if (!isSuperAdmin && userClinicId !== queue.clinicId) {
      throw new ForbiddenException('Access denied to this queue entry');
    }

    return queue;
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

  async getByStatusTenantScoped(
    clinicId: string,
    status: string,
    userClinicId: string | null,
    isSuperAdmin: boolean,
  ) {
    if (!isSuperAdmin && userClinicId !== clinicId) {
      throw new ForbiddenException('Access denied to this clinic');
    }

    return this.repo.findByClinicIdAndStatus(clinicId, status);
  }

  async getMyQueuePosition(patientId: string, clinicId: string) {
    const entry = await this.repo.findActiveForPatient(patientId, clinicId);
    if (!entry) return null;
    return {
      queueId: entry.id,
      position: entry.position,
      status: entry.status,
      calledAt: entry.calledAt,
      consultationStartedAt: entry.consultationStartedAt,
      appointment: {
        id: entry.appointment.id,
        appointmentTime: entry.appointment.appointmentTime,
        doctor: entry.appointment.doctor,
      },
    };
  }

  async createForAppointment(clinicId: string, appointmentId: string) {
    return this.repo.create({ clinicId, appointmentId });
  }

  async cancelByAppointmentId(appointmentId: string) {
    const queue = await this.repo.findByAppointmentId(appointmentId);
    if (queue) {
      await this.repo.delete(queue.id);
    }
  }

  async updateStatus(queueId: string, status: string) {
    const queue = await this.repo.findById(queueId);
    if (!queue) throw new NotFoundException('Queue entry not found');

    const validStatuses = ['waiting', 'called', 'in_consultation', 'done', 'no_show'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException('Invalid queue status');
    }

    return this.repo.updateStatus(queueId, status);
  }

  async autoCompleteStaleConsultations() {
    const stale = await this.repo.findStaleConsultations();
    for (const q of stale) {
      await this.repo.updateStatus(q.id, 'done');
    }
    return stale.length;
  }

  async autoMarkNoShow() {
    const missed = await this.repo.findMissedAppointments();
    for (const q of missed) {
      await this.repo.updateStatus(q.id, 'no_show');
    }
    return missed.length;
  }

  async delete(queueId: string) {
    const queue = await this.repo.findById(queueId);
    if (!queue) throw new NotFoundException('Queue entry not found');

    return this.repo.delete(queueId);
  }
}
