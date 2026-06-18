import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { MailService } from '../../email/mail.service';

@Processor('email')
export class EmailWorker extends WorkerHost {
  private readonly logger = new Logger(EmailWorker.name);

  constructor(private readonly mailService: MailService) {
    super();
  }

  async process(job: Job): Promise<any> {
    const { to, subject, template, data } = job.data;

    this.logger.log(`Processing email job ${job.id}: ${to} (${template})`);

    try {
      const html = this.renderTemplate(template, data);
      await this.mailService['transporter']?.sendMail({
        from: 'noreply@propertyos.in',
        to,
        subject,
        html,
      });
      this.logger.log(`Email sent: ${job.id} to ${to}`);
      return { success: true, to };
    } catch (error) {
      this.logger.error(`Email failed: ${job.id} - ${(error as Error).message}`);
      throw error;
    }
  }

  private renderTemplate(template: string, data: Record<string, any>): string {
    const templates: Record<string, (d: Record<string, any>) => string> = {
      'change-request': (d) => `
        <!DOCTYPE html>
        <html>
        <body style="font-family:Arial,sans-serif;padding:20px;">
          <h2 style="color:#1a56db;">New Change Request</h2>
          <p><strong>${d.requesterName}</strong> has submitted a change request for <strong>${d.entityType}</strong>.</p>
          <p>Please review and approve/reject the changes.</p>
          <a href="${process.env.APP_URL || 'http://localhost:3000'}/change-requests/${d.changeRequestId}"
             style="display:inline-block;padding:10px 20px;background:#1a56db;color:#fff;text-decoration:none;border-radius:4px;">
            Review Request
          </a>
        </body>
        </html>`,
      'approval-result': (d) => `
        <!DOCTYPE html>
        <html>
        <body style="font-family:Arial,sans-serif;padding:20px;">
          <h2 style="color:${d.status === 'approved' ? '#059669' : '#dc2626'};">
            Change Request ${d.status.replace(/_/g, ' ').toUpperCase()}
          </h2>
          <p>Your change request has been <strong>${d.status.replace(/_/g, ' ')}</strong> by ${d.adminName}.</p>
          <p>Change Request ID: ${d.changeRequestId}</p>
        </body>
        </html>`,
      'task-assignment': (d) => `
        <!DOCTYPE html>
        <html>
        <body style="font-family:Arial,sans-serif;padding:20px;">
          <h2 style="color:#1a56db;">New Task Assigned</h2>
          <p>You have been assigned a new task: <strong>${d.taskTitle}</strong></p>
          <p>Assigned by: ${d.assignerName}</p>
          ${d.dueDate ? `<p>Due: ${d.dueDate}</p>` : ''}
        </body>
        </html>`,
      'site-visit-reminder': (d) => `
        <!DOCTYPE html>
        <html>
        <body style="font-family:Arial,sans-serif;padding:20px;">
          <h2 style="color:#1a56db;">Site Visit Reminder</h2>
          <p>You have a site visit scheduled:</p>
          <ul>
            <li>Client: ${d.clientName}</li>
            <li>Building: ${d.buildingName}</li>
            <li>Time: ${d.scheduledAt}</li>
          </ul>
        </body>
        </html>`,
    };

    const renderer = templates[template];
    if (!renderer) {
      this.logger.warn(`Unknown template: ${template}`);
      return `<p>Notification: ${JSON.stringify(data)}</p>`;
    }
    return renderer(data);
  }
}
