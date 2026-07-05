// apps/api/src/modules/doctors/dto/create-doctor.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateDoctorDto {
  @ApiProperty({ description: 'UUID of the existing User account for this doctor' })
  @IsString()
  userId!: string;

  @ApiProperty({ description: 'UUID of the clinic this doctor belongs to' })
  @IsString()
  clinicId!: string;

  @ApiPropertyOptional({ example: 'Cardiology', default: 'General' })
  @IsOptional()
  @IsString()
  specialization?: string;

  @ApiPropertyOptional({ example: 30, minimum: 15, description: 'Slot duration in minutes' })
  @IsOptional()
  @IsNumber()
  @Min(15)
  consultationDuration?: number;
}
