// apps/api/src/modules/auth/infrastructure/auth.controller.ts
import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from '../application/auth.service';
import { AuthTokens } from '../domain/auth.types';
import { PatientLoginDto } from '../dto/patient-login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { StaffLoginDto } from '../dto/staff-login.dto';
import { JwtAuthGuard } from '../../../shared/guards';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('staff/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Staff login with email and password' })
  @ApiResponse({ status: 200, description: 'Returns access + refresh token pair' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async staffLogin(@Body() dto: StaffLoginDto): Promise<AuthTokens> {
    return this.auth.staffLogin(dto.email, dto.password);
  }

  @Post('patient/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Patient login via Firebase OTP phone verification',
    description:
      'Client completes Firebase phone OTP flow, sends the resulting ID token. Backend verifies with Firebase Admin SDK, looks up the pre-registered patient by phone number, and returns a Huggi JWT pair.',
  })
  @ApiResponse({ status: 200, description: 'Returns access + refresh token pair for patient' })
  @ApiResponse({ status: 401, description: 'Invalid Firebase token or phone not registered' })
  @ApiResponse({ status: 404, description: 'No patient registered with this phone number' })
  async patientLogin(@Body() dto: PatientLoginDto): Promise<AuthTokens> {
    return this.auth.patientLogin(dto.idToken);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate refresh token and issue a new token pair' })
  @ApiResponse({ status: 200, description: 'New access + refresh token pair' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refresh(@Body() dto: RefreshTokenDto): Promise<AuthTokens> {
    return this.auth.refresh(dto.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke refresh token on the server and clear session' })
  @ApiResponse({ status: 204, description: 'Logged out successfully' })
  async logout(@Body() dto: RefreshTokenDto): Promise<void> {
    await this.auth.logout(dto.refreshToken);
  }
}
