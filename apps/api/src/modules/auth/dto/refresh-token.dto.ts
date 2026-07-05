// apps/api/src/modules/auth/dto/refresh-token.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Opaque refresh token received from login or previous refresh',
    minLength: 32,
  })
  @IsString()
  @MinLength(32)
  refreshToken!: string;
}
