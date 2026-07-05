// apps/api/src/modules/auth/dto/patient-login.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class PatientLoginDto {
  @ApiProperty({
    description: 'Firebase ID token obtained after successful OTP verification on the client',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6...',
  })
  @IsString()
  @IsNotEmpty()
  idToken!: string;
}
