// apps/api/src/modules/doctors/dto/update-doctor.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateDoctorDto {
  @ApiPropertyOptional({ example: 'Neurology' })
  @IsOptional()
  @IsString()
  specialization?: string;

  @ApiPropertyOptional({ example: 20, minimum: 15 })
  @IsOptional()
  @IsNumber()
  @Min(15)
  consultationDuration?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the doctor is accepting patients today',
  })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}
