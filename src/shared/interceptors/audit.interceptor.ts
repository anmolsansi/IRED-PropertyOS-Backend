import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const { method, url, ip, headers } = request;
    const user = request.user;
    const userAgent = headers['user-agent'] || '';

    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          this.logEvent({
            actorUserId: user?.id,
            eventType: `${method} ${url}`,
            metadata: {
              method,
              url,
              duration,
              statusCode: context.switchToHttp().getResponse().statusCode,
            },
            ipAddress: ip,
            userAgent,
          }).catch(() => {});
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          this.logEvent({
            actorUserId: user?.id,
            eventType: `${method} ${url}_error`,
            metadata: {
              method,
              url,
              duration,
              error: error.message,
            },
            ipAddress: ip,
            userAgent,
          }).catch(() => {});
        },
      }),
    );
  }

  private async logEvent(data: {
    actorUserId?: string;
    eventType: string;
    metadata: Record<string, unknown>;
    ipAddress?: string;
    userAgent: string;
  }) {
    try {
      await this.prisma.auditEvent.create({
        data: {
          actorUserId: data.actorUserId || null,
          eventType: data.eventType,
          entityType: 'system',
          entityId: null,
          metadataJson: data.metadata as unknown as Record<string, string>,
          ipAddress: data.ipAddress || null,
          userAgent: data.userAgent,
        },
      });
    } catch {
      // Silently fail - audit logging should never break the request
    }
  }
}
