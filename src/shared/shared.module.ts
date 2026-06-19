import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { RolesGuard } from './guards/roles.guard';
import { OrgGuard } from './guards/org.guard';
import { GeographyGuard } from './guards/geography.guard';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { AuditInterceptor } from './interceptors/audit.interceptor';
import { AllExceptionsFilter } from './filters/http-exception.filter';
import { PrismaModule } from '../prisma/prisma.module';
import { EncryptionService } from './services/encryption.service';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: OrgGuard,
    },
    {
      provide: APP_GUARD,
      useClass: GeographyGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    EncryptionService,
  ],
  exports: [EncryptionService],
})
export class SharedModule {}
