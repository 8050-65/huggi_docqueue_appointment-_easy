// apps/api/src/modules/clinics/application/clinic.service.ts
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ClinicRepository } from '../infrastructure/clinic.repository';

@Injectable()
export class ClinicService {
  constructor(private readonly repo: ClinicRepository) {}

  async getByIdTenantScoped(clinicId: string, userClinicId: string | null, isSuperAdmin: boolean) {
    if (!isSuperAdmin && userClinicId !== clinicId) {
      throw new ForbiddenException('Access denied to this clinic');
    }

    const clinic = await this.repo.findById(clinicId);
    if (!clinic) throw new NotFoundException('Clinic not found');

    return clinic;
  }

  async getAll() {
    return this.repo.findAll();
  }

  async create(data: { name: string; address: string; phone: string }) {
    return this.repo.create(data);
  }

  async update(clinicId: string, data: Partial<{ name: string; address: string; phone: string }>) {
    const clinic = await this.repo.findById(clinicId);
    if (!clinic) throw new NotFoundException('Clinic not found');

    return this.repo.update(clinicId, data);
  }

  async delete(clinicId: string) {
    const clinic = await this.repo.findById(clinicId);
    if (!clinic) throw new NotFoundException('Clinic not found');

    return this.repo.softDelete(clinicId);
  }
}
