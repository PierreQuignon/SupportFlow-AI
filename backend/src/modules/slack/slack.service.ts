import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface SlackHighPriorityPayload {
  id: string;
  fromName: string;
  fromEmail: string;
  subject: string;
  category: string;
  aiSummary: string;
}

@Injectable()
export class SlackService {
  private readonly logger = new Logger(SlackService.name);

  constructor(private readonly configService: ConfigService) {}

  async notifyHighPriority(email: SlackHighPriorityPayload): Promise<void> {
    const webhookUrl = this.configService.get<string>('SLACK_WEBHOOK_URL');
    if (!webhookUrl) {
      this.logger.warn('SLACK_WEBHOOK_URL not set — skipping Slack notification');
      return;
    }

    const appUrl = this.configService.get<string>('APP_URL') ?? 'http://localhost:3000';
    const emailUrl = `${appUrl}/inbox/${email.id}`;

    const body = {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🔴 High priority email',
          },
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*From:*\n${email.fromName}` },
            { type: 'mrkdwn', text: `*Category:*\n${email.category}` },
            { type: 'mrkdwn', text: `*Subject:*\n${email.subject}` },
          ],
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Summary:*\n${email.aiSummary}`,
          },
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: { type: 'plain_text', text: 'View email' },
              url: emailUrl,
              style: 'primary',
            },
          ],
        },
      ],
    };

    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        this.logger.error(`Slack webhook returned ${res.status}: ${await res.text()}`);
      }
    } catch (error) {
      this.logger.error('Slack notification failed', (error as Error).stack);
    }
  }
}
