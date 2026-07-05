// apps/api/src/modules/appointments/dto/create-appointment.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateAppointmentDto {
  @ApiProperty({ description: 'UUID of the clinic' })
  @IsString()
  clinicId!: string;

  @ApiProperty({ description: 'UUID of the patient' })
  @IsString()
  patientId!: string;

  @ApiProperty({ description: 'UUID of the doctor' })
  @IsString()
  doctorId!: string;

  @ApiProperty({
    example: '2026-06-15T10:30:00.000Z',
    description: 'ISO 8601 appointment datetime',
  })
  @IsDateString()
  appointmentTime!: string;

  @ApiPropertyOptional({ example: 'Follow-up for hypertension' })
  @IsOptional()
  @IsString()
  notes?: string;
}
