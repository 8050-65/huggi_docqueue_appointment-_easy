// apps/api/src/modules/appointments/appointments.module.ts
import { Module } from '@nestjs/common';
import { AppointmentService } from './application/appointment.service';
import { AppointmentController } from './infrastructure/appointment.controller';
import { AppointmentRepository } from './infrastructure/appointment.repository';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [QueueModule],
  controllers: [AppointmentController],
  providers: [AppointmentService, AppointmentRepository],
  exports: [AppointmentService],
})
export class AppointmentsModule {}
