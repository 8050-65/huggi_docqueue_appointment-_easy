// apps/api/src/modules/clinics/clinics.module.ts
import { Module } from '@nestjs/common';
import { ClinicService } from './application/clinic.service';
import { ClinicController } from './infrastructure/clinic.controller';
import { ClinicRepository } from './infrastructure/clinic.repository';

@Module({
  controllers: [ClinicController],
  providers: [ClinicService, ClinicRepository],
  exports: [ClinicService],
})
export class ClinicsModule {}
