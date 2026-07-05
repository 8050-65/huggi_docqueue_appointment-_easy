// apps/api/src/modules/auth/dto/staff-login.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class StaffLoginDto {
  @ApiProperty({ example: 'admin@clinic.com', description: 'Staff email address' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'secret123', minLength: 8, description: 'Staff password' })
  @IsString()
  @MinLength(8)
  password!: string;
}
