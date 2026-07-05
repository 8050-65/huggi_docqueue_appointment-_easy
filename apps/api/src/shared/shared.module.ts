// apps/api/src/shared/shared.module.ts
// Provides guards globally so feature modules don't each re-import them.
import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard, RolesGuard, TenantGuard, PatientGuard } from './guards';

@Global()
@Module({
  imports: [JwtModule.register({})],
  providers: [JwtAuthGuard, RolesGuard, TenantGuard, PatientGuard],
  exports: [JwtAuthGuard, RolesGuard, TenantGuard, PatientGuard, JwtModule],
})
export class SharedModule {}
