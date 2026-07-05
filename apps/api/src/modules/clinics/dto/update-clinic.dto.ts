// apps/api/src/modules/clinics/dto/update-clinic.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateClinicDto {
  @ApiPropertyOptional({ example: 'Sunrise Super Clinic' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  name?: string;

  @ApiPropertyOptional({ example: '45, FC Road, Pune, Maharashtra 411004' })
  @IsOptional()
  @IsString()
  @MinLength(5)
  address?: string;

  @ApiPropertyOptional({ example: '9876543211' })
  @IsOptional()
  @IsString()
  @MinLength(10)
  phone?: string;
}
