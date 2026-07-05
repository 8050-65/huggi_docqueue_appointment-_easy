// apps/api/src/modules/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthService } from './application/auth.service';
import { AuthController } from './infrastructure/auth.controller';
import { RefreshTokenRepository } from './infrastructure/refresh-token.repository';
import { FirebaseAdminService } from './infrastructure/firebase-admin.service';

@Module({
  // JwtModule and ConfigModule are globally available via SharedModule + AppModule
  controllers: [AuthController],
  providers: [AuthService, RefreshTokenRepository, FirebaseAdminService],
  exports: [AuthService],
})
export class AuthModule {}
