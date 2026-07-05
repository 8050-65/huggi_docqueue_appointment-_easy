// apps/api/src/modules/clinics/infrastructure/clinic.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Roles } from '../../../shared/decorators';
import { JwtAuthGuard, RolesGuard, TenantGuard } from '../../../shared/guards';
import { JwtPayload } from '../../../shared/types/jwt-payload.type';
import { ClinicService } from '../application/clinic.service';
import { CreateClinicDto } from '../dto/create-clinic.dto';
import { UpdateClinicDto } from '../dto/update-clinic.dto';

@ApiTags('Clinics')
@ApiBearerAuth()
@Controller('clinics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClinicController {
  constructor(private readonly clinic: ClinicService) {}

  @Get()
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'List all clinics (super admin only)' })
  @ApiResponse({ status: 200, description: 'Array of all clinic records' })
  async listAll() {
    return this.clinic.getAll();
  }

  @Get(':clinicId')
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'Get clinic details including staff roster' })
  @ApiResponse({ status: 200, description: 'Clinic with clinicUsers' })
  @ApiResponse({ status: 404, description: 'Clinic not found' })
  async getById(@Param('clinicId') clinicId: string, @CurrentUser() user: JwtPayload) {
    return this.clinic.getByIdTenantScoped(clinicId, user.clinicId, user.isSuperAdmin);
  }

  @Post()
  @Roles('SUPER_ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new clinic (super admin only)' })
  @ApiResponse({ status: 201, description: 'Clinic created' })
  async create(@Body() dto: CreateClinicDto) {
    return this.clinic.create(dto);
  }

  @Patch(':clinicId')
  @UseGuards(TenantGuard)
  @Roles('CLINIC_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Update clinic details' })
  @ApiResponse({ status: 200, description: 'Updated clinic' })
  async update(
    @Param('clinicId') clinicId: string,
    @Body() dto: UpdateClinicDto,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.clinic.getByIdTenantScoped(clinicId, user.clinicId, user.isSuperAdmin);
    return this.clinic.update(clinicId, dto);
  }

  @Delete(':clinicId')
  @UseGuards(TenantGuard)
  @Roles('SUPER_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a clinic (super admin only)' })
  @ApiResponse({ status: 204, description: 'Clinic deleted' })
  async delete(@Param('clinicId') clinicId: string) {
    await this.clinic.delete(clinicId);
  }
}
