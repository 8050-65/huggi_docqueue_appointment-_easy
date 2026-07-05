// apps/api/src/modules/users/dto/create-user.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'nurse.priya@clinic.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'secret123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ example: 'Priya Sharma', minLength: 2 })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiPropertyOptional({ example: '9876500001' })
  @IsOptional()
  @IsString()
  @MinLength(10)
  phone?: string;

  @ApiProperty({ description: 'UUID of the clinic to assign this staff member to' })
  @IsString()
  clinicId!: string;

  @ApiProperty({
    example: 'NURSE',
    description:
      'Staff role: CLINIC_ADMIN | RECEPTIONIST | NURSE | DOCTOR | CARE_TAKER | SECURITY | BILLING_STAFF',
  })
  @IsString()
  role!: string;
}
