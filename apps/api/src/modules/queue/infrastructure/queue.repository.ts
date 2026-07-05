// apps/api/src/modules/queue/infrastructure/queue.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../db/prisma.service';

@Injectable()
export class QueueRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(queueId: string) {
    return this.prisma.queue.findFirst({
      where: { id: queueId },
    });
  }

  async findByAppointmentId(appointmentId: string) {
    return this.prisma.queue.findFirst({
      where: { appointmentId },
    });
  }

  async findByClinicId(clinicId: string) {
    return this.prisma.queue.findMany({
      where: {
        clinicId,
        appointment: { status: { notIn: ['cancelled', 'no_show'] } },
      },
      orderBy: { position: 'asc' },
      include: {
        appointment: {
          include: {
            patient: { include: { user: { select: { id: true, name: true, phone: true } } } },
            doctor: { include: { user: { select: { id: true, name: true } } } },
          },
        },
      },
    });
  }

  async findByClinicIdAndStatus(clinicId: string, status: string) {
    return this.prisma.queue.findMany({
      where: {
        clinicId,
        status,
        appointment: { status: { notIn: ['cancelled', 'no_show'] } },
      },
      orderBy: { position: 'asc' },
      include: {
        appointment: {
          include: {
            patient: { include: { user: { select: { id: true, name: true, phone: true } } } },
            doctor: { include: { user: { select: { id: true, name: true } } } },
          },
        },
      },
    });
  }

  async findActiveForPatient(patientId: string, clinicId: string) {
    return this.prisma.queue.findFirst({
      where: {
        clinicId,
        status: { in: ['waiting', 'called', 'in_consultation'] },
        appointment: { patientId },
      },
      include: {
        appointment: {
          include: {
            doctor: { include: { user: { select: { id: true, name: true } } } },
          },
        },
      },
    });
  }

  async create(data: { clinicId: string; appointmentId: string }) {
    return this.prisma.$transaction(
      async (tx) => {
        const maxPosition = await tx.queue.findFirst({
          where: { clinicId: data.clinicId, status: 'waiting' },
          orderBy: { position: 'desc' },
          select: { position: true },
        });

        return tx.queue.create({
          data: {
            clinicId: data.clinicId,
            appointmentId: data.appointmentId,
            position: (maxPosition?.position ?? 0) + 1,
          },
        });
      },
      { isolationLevel: 'Serializable' },
    );
  }

  async updateStatus(queueId: string, status: string) {
    const updateData: any = { status };

    if (status === 'called') {
      updateData.calledAt = new Date();
    } else if (status === 'in_consultation') {
      updateData.consultationStartedAt = new Date();
    } else if (status === 'done') {
      updateData.consultationEndedAt = new Date();
    }

    return this.prisma.queue.update({
      where: { id: queueId },
      data: updateData,
    });
  }

  async updatePosition(clinicId: string, currentPosition: number) {
    const queues = await this.prisma.queue.findMany({
      where: { clinicId, position: { gt: currentPosition }, status: 'waiting' },
    });

    await Promise.all(
      queues.map((q) =>
        this.prisma.queue.update({
          where: { id: q.id },
          data: { position: q.position - 1 },
        }),
      ),
    );
  }

  async findStaleConsultations(): Promise<Array<{ id: string }>> {
    return this.prisma.$queryRaw`
      SELECT q.id
      FROM queues q
      JOIN appointments a ON a.id = q.appointment_id
      JOIN doctors d ON d.id = a.doctor_id
      WHERE q.status = 'in_consultation'
        AND q.consultation_started_at IS NOT NULL
        AND q.consultation_started_at + (d.consultation_duration * interval '1 minute') < NOW()
    `;
  }

  async findMissedAppointments(): Promise<Array<{ id: string }>> {
    return this.prisma.$queryRaw`
      SELECT q.id
      FROM queues q
      JOIN appointments a ON a.id = q.appointment_id
      JOIN doctors d ON d.id = a.doctor_id
      WHERE q.status = 'waiting'
        AND a.appointment_time + (d.consultation_duration * interval '1 minute') < NOW()
    `;
  }

  async delete(queueId: string) {
    const queue = await this.findById(queueId);
    if (queue) {
      await this.updatePosition(queue.clinicId, queue.position);
    }
    return this.prisma.queue.delete({
      where: { id: queueId },
    });
  }
}
