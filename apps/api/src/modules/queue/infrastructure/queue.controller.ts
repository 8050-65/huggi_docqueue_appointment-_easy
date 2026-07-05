// apps/api/src/modules/queue/infrastructure/queue.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Roles } from '../../../shared/decorators';
import { JwtAuthGuard, PatientGuard, RolesGuard, TenantGuard } from '../../../shared/guards';
import { JwtPayload } from '../../../shared/types/jwt-payload.type';
import { QueueService } from '../application/queue.service';
import { UpdateQueueDto } from '../dto/update-queue.dto';

@ApiTags('Queue')
@ApiBearerAuth()
@Controller('queue')
@UseGuards(JwtAuthGuard, RolesGuard)
export class QueueController {
  constructor(private readonly queue: QueueService) {}

  @Get()
  @Roles('CLINIC_ADMIN', 'RECEPTIONIST', 'NURSE', 'SECURITY')
  @ApiOperation({
    summary: 'List clinic queue entries, optionally filtered by status (staff only)',
  })
  @ApiQuery({ name: 'clinicId', required: true })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['waiting', 'called', 'in_consultation', 'done', 'no_show'],
  })
  @ApiResponse({
    status: 200,
    description: 'Queue entries with nested appointment, patient, and doctor data',
  })
  async listByClinic(
    @Query('clinicId') clinicId: string,
    @Query('status') status: string,
    @CurrentUser() user: JwtPayload,
  ) {
    if (status) {
      return this.queue.getByStatusTenantScoped(clinicId, status, user.clinicId, user.isSuperAdmin);
    }
    return this.queue.getByClinicIdTenantScoped(clinicId, user.clinicId, user.isSuperAdmin);
  }

  @Get('my-position')
  @UseGuards(JwtAuthGuard, PatientGuard)
  @ApiOperation({
    summary: "Get authenticated patient's current queue position",
    description:
      "Patient-only endpoint. Returns the active queue entry (waiting/called/in_consultation) for the patient's most recent appointment today.",
  })
  @ApiResponse({ status: 200, description: 'Queue position and status, or null if not in queue' })
  @ApiResponse({ status: 403, description: 'Not a patient token' })
  async myPosition(@CurrentUser() user: JwtPayload) {
    return this.queue.getMyQueuePosition(user.patientId!, user.clinicId!);
  }

  @Get(':queueId')
  @UseGuards(TenantGuard)
  @Roles('CLINIC_ADMIN', 'RECEPTIONIST', 'NURSE', 'SECURITY')
  @ApiOperation({ summary: 'Get a single queue entry by ID (staff only)' })
  @ApiResponse({ status: 200, description: 'Queue entry' })
  @ApiResponse({ status: 404, description: 'Queue entry not found' })
  async getById(@Param('queueId') queueId: string, @CurrentUser() user: JwtPayload) {
    return this.queue.getByIdTenantScoped(queueId, user.clinicId, user.isSuperAdmin);
  }

  @Patch(':queueId')
  @UseGuards(TenantGuard)
  @Roles('CLINIC_ADMIN', 'NURSE')
  @ApiOperation({ summary: 'Update queue entry status (staff only)' })
  @ApiResponse({ status: 200, description: 'Updated queue entry' })
  @ApiResponse({ status: 400, description: 'Invalid status value' })
  async update(
    @Param('queueId') queueId: string,
    @Body() dto: UpdateQueueDto,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.queue.getByIdTenantScoped(queueId, user.clinicId, user.isSuperAdmin);
    return this.queue.updateStatus(queueId, dto.status);
  }

  @Delete(':queueId')
  @UseGuards(TenantGuard)
  @Roles('CLINIC_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a queue entry and recompact positions (admin only)' })
  @ApiResponse({ status: 204, description: 'Queue entry deleted' })
  async delete(@Param('queueId') queueId: string, @CurrentUser() user: JwtPayload) {
    await this.queue.getByIdTenantScoped(queueId, user.clinicId, user.isSuperAdmin);
    return this.queue.delete(queueId);
  }
}
