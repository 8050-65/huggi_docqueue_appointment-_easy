// apps/api/src/modules/doctors/doctors.module.ts
import { Module } from '@nestjs/common';
import { DoctorService } from './application/doctor.service';
import { DoctorController } from './infrastructure/doctor.controller';
import { DoctorRepository } from './infrastructure/doctor.repository';

@Module({
  controllers: [DoctorController],
  providers: [DoctorService, DoctorRepository],
  exports: [DoctorService],
})
export class DoctorsModule {}
