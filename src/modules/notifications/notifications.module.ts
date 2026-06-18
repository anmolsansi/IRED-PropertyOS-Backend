import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { EmailWorker } from './workers/email.worker';
import { PrismaModule } from '../../prisma/prisma.module';
import { MailModule } from '../email/mail.module';

@Module({
  imports: [
    PrismaModule,
    MailModule,
    BullModule.forRootAsync({
      imports: [],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('app.redis.host') || 'localhost',
          port: config.get<number>('app.redis.port') || 6379,
          password: config.get<string>('app.redis.password') || undefined,
        },
      }),
    }),
    BullModule.registerQueue(
      { name: 'email', defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 2000 } } },
      { name: 'sms', defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 2000 } } },
      { name: 'push', defaultJobOptions: { attempts: 1 } },
    ),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, EmailWorker],
  exports: [NotificationsService],
})
export class NotificationsModule {}
