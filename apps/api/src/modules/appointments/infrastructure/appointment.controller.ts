// apps/api/src/modules/appointments/infrastructure/appointment.controller.ts
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
import { AppointmentService } from '../application/appointment.service';
import { CreateAppointmentDto } from '../dto/create-appointment.dto';
import { UpdateAppointmentDto } from '../dto/update-appointment.dto';

@ApiTags('Appointments')
@ApiBearerAuth()
@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AppointmentController {
  constructor(private readonly appointment: AppointmentService) {}

  @Get()
  @Roles('CLINIC_ADMIN', 'RECEPTIONIST', 'NURSE', 'DOCTOR')
  @ApiOperation({ summary: 'List all appointments for a clinic (staff only)' })
  @ApiQuery({ name: 'clinicId', required: true, description: 'Clinic UUID' })
  @ApiResponse({ status: 200, description: 'Array of appointment records' })
  async listByClinic(@Query('clinicId') clinicId: string, @CurrentUser() user: JwtPayload) {
    return this.appointment.getByClinicIdTenantScoped(clinicId, user.clinicId, user.isSuperAdmin);
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard, PatientGuard)
  @ApiOperation({
    summary: "Get authenticated patient's own appointments",
    description: 'Patient-only endpoint. Requires a JWT issued via POST /auth/patient/login.',
  })
  @ApiResponse({
    status: 200,
    description: "Array of the patient's appointments with doctor details",
  })
  @ApiResponse({ status: 403, description: 'Not a patient token' })
  async mine(@CurrentUser() user: JwtPayload) {
    return this.appointment.getMineForPatient(user.patientId!, user.clinicId!);
  }

  @Get('by-patient/:patientId')
  @Roles('CLINIC_ADMIN', 'RECEPTIONIST', 'NURSE', 'DOCTOR', 'CARE_TAKER')
  @ApiOperation({ summary: 'Get appointments for a specific patient (staff only)' })
  @ApiResponse({ status: 200, description: 'Array of appointments for the patient' })
  async getByPatient(@Param('patientId') patientId: string, @CurrentUser() user: JwtPayload) {
    const clinicId = user.isSuperAdmin ? undefined : user.clinicId!;
    return this.appointment.getByPatientIdTenantScoped(
      patientId,
      clinicId!,
      user.clinicId,
      user.isSuperAdmin,
    );
  }

  @Get(':appointmentId')
  @UseGuards(TenantGuard)
  @Roles('CLINIC_ADMIN', 'RECEPTIONIST', 'NURSE', 'DOCTOR', 'CARE_TAKER')
  @ApiOperation({ summary: 'Get a single appointment by ID (staff only)' })
  @ApiResponse({ status: 200, description: 'Appointment record' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async getById(@Param('appointmentId') appointmentId: string, @CurrentUser() user: JwtPayload) {
    return this.appointment.getByIdTenantScoped(appointmentId, user.clinicId, user.isSuperAdmin);
  }

  @Post()
  @Roles('CLINIC_ADMIN', 'RECEPTIONIST')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Book a new appointment (staff only)' })
  @ApiResponse({ status: 201, description: 'Appointment created and added to queue' })
  @ApiResponse({
    status: 409,
    description: 'Doctor already booked at this time, or time is in the past',
  })
  async create(@Body() dto: CreateAppointmentDto, @CurrentUser() user: JwtPayload) {
    if (!user.isSuperAdmin && user.clinicId !== dto.clinicId) {
      throw new ForbiddenException('Clinic mismatch');
    }
    return this.appointment.create(dto);
  }

  @Patch(':appointmentId')
  @UseGuards(TenantGuard)
  @Roles('CLINIC_ADMIN', 'NURSE', 'DOCTOR')
  @ApiOperation({ summary: 'Update appointment time, status, or notes (staff only)' })
  @ApiResponse({ status: 200, description: 'Updated appointment' })
  async update(
    @Param('appointmentId') appointmentId: string,
    @Body() dto: UpdateAppointmentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.appointment.getByIdTenantScoped(appointmentId, user.clinicId, user.isSuperAdmin);
    return this.appointment.update(appointmentId, dto);
  }

  @Post(':appointmentId/cancel')
  @UseGuards(TenantGuard)
  @Roles('CLINIC_ADMIN', 'RECEPTIONIST', 'NURSE', 'DOCTOR')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel an appointment and remove its queue entry (staff only)' })
  @ApiResponse({ status: 200, description: 'Appointment cancelled' })
  async cancel(@Param('appointmentId') appointmentId: string, @CurrentUser() user: JwtPayload) {
    await this.appointment.getByIdTenantScoped(appointmentId, user.clinicId, user.isSuperAdmin);
    return this.appointment.cancel(appointmentId);
  }

  @Delete(':appointmentId')
  @UseGuards(TenantGuard)
  @Roles('CLINIC_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hard-delete an appointment and its queue entry (admin only)' })
  @ApiResponse({ status: 204, description: 'Appointment deleted' })
  async delete(@Param('appointmentId') appointmentId: string, @CurrentUser() user: JwtPayload) {
    await this.appointment.getByIdTenantScoped(appointmentId, user.clinicId, user.isSuperAdmin);
    return this.appointment.delete(appointmentId);
  }
}
