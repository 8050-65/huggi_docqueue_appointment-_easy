// apps/api/src/modules/appointments/dto/update-appointment.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateAppointmentDto {
  @ApiPropertyOptional({ example: '2026-06-15T11:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  appointmentTime?: string;

  @ApiPropertyOptional({ example: 'booked', description: 'booked | done | no_show' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: 'Patient rescheduled' })
  @IsOptional()
  @IsString()
  notes?: string;
}
