// apps/api/src/modules/clinics/dto/create-clinic.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateClinicDto {
  @ApiProperty({ example: 'Sunrise Clinic', minLength: 3 })
  @IsString()
  @MinLength(3)
  name!: string;

  @ApiProperty({ example: '12, MG Road, Pune, Maharashtra 411001', minLength: 5 })
  @IsString()
  @MinLength(5)
  address!: string;

  @ApiProperty({
    example: '9876543210',
    minLength: 10,
    description: '10-digit clinic phone number',
  })
  @IsString()
  @MinLength(10)
  phone!: string;
}
