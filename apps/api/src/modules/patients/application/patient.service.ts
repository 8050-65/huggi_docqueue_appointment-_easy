// apps/api/src/modules/patients/application/patient.service.ts
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PatientRepository } from '../infrastructure/patient.repository';

@Injectable()
export class PatientService {
  constructor(private readonly repo: PatientRepository) {}

  async getById(patientId: string, clinicId: string) {
    const patient = await this.repo.findById(patientId);
    if (!patient) throw new NotFoundException('Patient not found');

    if (patient.clinicId !== clinicId) {
      throw new ForbiddenException('Access denied to this patient');
    }

    return patient;
  }

  async getByIdTenantScoped(patientId: string, userClinicId: string | null, isSuperAdmin: boolean) {
    const patient = await this.repo.findById(patientId);
    if (!patient) throw new NotFoundException('Patient not found');

    if (!isSuperAdmin && userClinicId !== patient.clinicId) {
      throw new ForbiddenException('Access denied to this patient');
    }

    return patient;
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

  async create(data: { name: string; phone: string; clinicId: string; notes?: string }) {
    const existing = await this.repo.findByPhone(data.phone);
    if (existing) {
      throw new ConflictException('A patient with this phone number already exists');
    }

    return this.repo.createWithUser(data);
  }

  async update(
    patientId: string,
    data: Partial<{
      notes: string;
      isActive: boolean;
    }>,
  ) {
    const patient = await this.repo.findById(patientId);
    if (!patient) throw new NotFoundException('Patient not found');

    return this.repo.update(patientId, data);
  }

  async delete(patientId: string) {
    const patient = await this.repo.findById(patientId);
    if (!patient) throw new NotFoundException('Patient not found');

    return this.repo.delete(patientId);
  }
}
