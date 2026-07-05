// apps/api/src/modules/patients/infrastructure/patient.controller.ts
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
import { JwtAuthGuard, PatientGuard, RolesGuard, TenantGuard } from '../../../shared/guards';
import { JwtPayload } from '../../../shared/types/jwt-payload.type';
import { PatientService } from '../application/patient.service';
import { CreatePatientDto } from '../dto/create-patient.dto';
import { UpdatePatientDto } from '../dto/update-patient.dto';

@ApiTags('Patients')
@ApiBearerAuth()
@Controller('patients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PatientController {
  constructor(private readonly patient: PatientService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard, PatientGuard)
  @ApiOperation({
    summary: "Get authenticated patient's own profile",
    description: 'Patient-only endpoint. Returns the authenticated patient record with user info.',
  })
  @ApiResponse({ status: 200, description: "Patient's own profile" })
  @ApiResponse({ status: 403, description: 'Not a patient token' })
  async getMe(@CurrentUser() user: JwtPayload) {
    return this.patient.getById(user.patientId!, user.clinicId!);
  }

  @Get()
  @Roles('CLINIC_ADMIN', 'RECEPTIONIST', 'NURSE', 'CARE_TAKER', 'BILLING_STAFF')
  @ApiOperation({ summary: 'List active patients for a clinic' })
  @ApiQuery({ name: 'clinicId', required: true })
  @ApiResponse({ status: 200, description: 'Array of patient records with user info' })
  async listByClinic(@Query('clinicId') clinicId: string, @CurrentUser() user: JwtPayload) {
    return this.patient.getByClinicIdTenantScoped(clinicId, user.clinicId, user.isSuperAdmin);
  }

  @Get(':patientId')
  @UseGuards(TenantGuard)
  @Roles('CLINIC_ADMIN', 'RECEPTIONIST', 'NURSE', 'CARE_TAKER', 'BILLING_STAFF')
  @ApiOperation({ summary: 'Get a single patient record' })
  @ApiResponse({ status: 200, description: 'Patient with user info' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async getById(@Param('patientId') patientId: string, @CurrentUser() user: JwtPayload) {
    return this.patient.getByIdTenantScoped(patientId, user.clinicId, user.isSuperAdmin);
  }

  @Post()
  @Roles('CLINIC_ADMIN', 'RECEPTIONIST')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new patient',
    description: 'Creates a User row and a Patient row atomically. Phone must be unique.',
  })
  @ApiResponse({ status: 201, description: 'Patient registered' })
  @ApiResponse({ status: 409, description: 'Phone number already registered' })
  async create(@Body() dto: CreatePatientDto, @CurrentUser() user: JwtPayload) {
    if (!user.isSuperAdmin && user.clinicId !== dto.clinicId) {
      throw new ForbiddenException('Clinic mismatch');
    }
    return this.patient.create(dto);
  }

  @Patch(':patientId')
  @UseGuards(TenantGuard)
  @Roles('CLINIC_ADMIN', 'RECEPTIONIST', 'NURSE')
  @ApiOperation({ summary: 'Update patient notes or active status' })
  @ApiResponse({ status: 200, description: 'Updated patient' })
  async update(
    @Param('patientId') patientId: string,
    @Body() dto: UpdatePatientDto,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.patient.getByIdTenantScoped(patientId, user.clinicId, user.isSuperAdmin);
    return this.patient.update(patientId, dto);
  }

  @Delete(':patientId')
  @UseGuards(TenantGuard)
  @Roles('CLINIC_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete a patient (sets isActive=false, preserves history)' })
  @ApiResponse({ status: 204, description: 'Patient deactivated' })
  async delete(@Param('patientId') patientId: string, @CurrentUser() user: JwtPayload) {
    await this.patient.getByIdTenantScoped(patientId, user.clinicId, user.isSuperAdmin);
    return this.patient.delete(patientId);
  }
}
