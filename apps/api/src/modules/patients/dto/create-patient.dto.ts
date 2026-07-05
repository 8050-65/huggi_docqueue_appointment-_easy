// apps/api/src/modules/patients/dto/create-patient.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreatePatientDto {
  @ApiProperty({ example: 'Ramesh Kumar', minLength: 2 })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({ example: '9876543210', minLength: 10, description: '10-digit mobile number' })
  @IsString()
  @MinLength(10)
  phone!: string;

  @ApiProperty({ description: 'UUID of the clinic this patient is registered at' })
  @IsString()
  clinicId!: string;

  @ApiPropertyOptional({ example: 'Diabetic, allergic to penicillin' })
  @IsOptional()
  @IsString()
  notes?: string;
}
