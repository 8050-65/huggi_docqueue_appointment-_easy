// apps/api/src/modules/doctors/infrastructure/doctor.controller.ts
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Roles } from '../../../shared/decorators';
import { JwtAuthGuard, RolesGuard, TenantGuard } from '../../../shared/guards';
import { JwtPayload } from '../../../shared/types/jwt-payload.type';
import { DoctorService } from '../application/doctor.service';
import { CreateDoctorDto } from '../dto/create-doctor.dto';
import { UpdateDoctorDto } from '../dto/update-doctor.dto';

@ApiTags('Doctors')
@ApiBearerAuth()
@Controller('doctors')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DoctorController {
  constructor(private readonly doctor: DoctorService) {}

  @Get()
  @Roles('CLINIC_ADMIN', 'RECEPTIONIST', 'NURSE')
  @ApiOperation({ summary: 'List doctors for a clinic' })
  @ApiQuery({ name: 'clinicId', required: true })
  @ApiResponse({ status: 200, description: 'Array of doctor profiles with user info' })
  async listByClinic(@Query('clinicId') clinicId: string, @CurrentUser() user: JwtPayload) {
    return this.doctor.getByClinicIdTenantScoped(clinicId, user.clinicId, user.isSuperAdmin);
  }

  @Get(':doctorId')
  @UseGuards(TenantGuard)
  @Roles('CLINIC_ADMIN', 'RECEPTIONIST', 'NURSE')
  @ApiOperation({ summary: 'Get a single doctor profile' })
  @ApiResponse({ status: 200, description: 'Doctor profile with user info' })
  @ApiResponse({ status: 404, description: 'Doctor not found' })
  async getById(@Param('doctorId') doctorId: string, @CurrentUser() user: JwtPayload) {
    return this.doctor.getByIdTenantScoped(doctorId, user.clinicId, user.isSuperAdmin);
  }

  @Post()
  @Roles('CLINIC_ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a doctor profile for an existing user (admin only)' })
  @ApiResponse({ status: 201, description: 'Doctor profile created' })
  async create(@Body() dto: CreateDoctorDto, @CurrentUser() user: JwtPayload) {
    if (!user.isSuperAdmin && user.clinicId !== dto.clinicId) {
      throw new ForbiddenException('Clinic mismatch');
    }
    return this.doctor.create(dto);
  }

  @Patch(':doctorId')
  @UseGuards(TenantGuard)
  @Roles('CLINIC_ADMIN')
  @ApiOperation({ summary: 'Update doctor specialization, duration, or availability (admin only)' })
  @ApiResponse({ status: 200, description: 'Updated doctor profile' })
  async update(
    @Param('doctorId') doctorId: string,
    @Body() dto: UpdateDoctorDto,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.doctor.getByIdTenantScoped(doctorId, user.clinicId, user.isSuperAdmin);
    return this.doctor.update(doctorId, dto);
  }

  @Delete(':doctorId')
  @UseGuards(TenantGuard)
  @Roles('CLINIC_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a doctor profile (admin only)' })
  @ApiResponse({ status: 204, description: 'Doctor deleted' })
  async delete(@Param('doctorId') doctorId: string, @CurrentUser() user: JwtPayload) {
    await this.doctor.getByIdTenantScoped(doctorId, user.clinicId, user.isSuperAdmin);
    return this.doctor.delete(doctorId);
  }
}
