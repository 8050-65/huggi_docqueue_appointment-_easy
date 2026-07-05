// apps/api/src/modules/doctors/application/doctor.service.ts
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DoctorRepository } from '../infrastructure/doctor.repository';

@Injectable()
export class DoctorService {
  constructor(private readonly repo: DoctorRepository) {}

  async getByIdTenantScoped(doctorId: string, userClinicId: string | null, isSuperAdmin: boolean) {
    const doctor = await this.repo.findById(doctorId);
    if (!doctor) throw new NotFoundException('Doctor not found');

    if (!isSuperAdmin && userClinicId !== doctor.clinicId) {
      throw new ForbiddenException('Access denied to this doctor');
    }

    return doctor;
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

  async create(data: {
    userId: string;
    clinicId: string;
    specialization?: string;
    consultationDuration?: number;
  }) {
    const existing = await this.repo.findByUserId(data.userId);
    if (existing) {
      throw new ConflictException('User already has a doctor profile');
    }

    return this.repo.create(data);
  }

  async update(
    doctorId: string,
    data: Partial<{
      specialization: string;
      consultationDuration: number;
      isAvailable: boolean;
    }>,
  ) {
    const doctor = await this.repo.findById(doctorId);
    if (!doctor) throw new NotFoundException('Doctor not found');

    return this.repo.update(doctorId, data);
  }

  async delete(doctorId: string) {
    const doctor = await this.repo.findById(doctorId);
    if (!doctor) throw new NotFoundException('Doctor not found');

    return this.repo.delete(doctorId);
  }
}
