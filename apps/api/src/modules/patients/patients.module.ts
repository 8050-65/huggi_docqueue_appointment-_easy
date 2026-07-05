// apps/api/src/modules/patients/patients.module.ts
import { Module } from '@nestjs/common';
import { PatientService } from './application/patient.service';
import { PatientController } from './infrastructure/patient.controller';
import { PatientRepository } from './infrastructure/patient.repository';

@Module({
  controllers: [PatientController],
  providers: [PatientService, PatientRepository],
  exports: [PatientService],
})
export class PatientsModule {}
