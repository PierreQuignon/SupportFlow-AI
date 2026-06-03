import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { Category, Priority } from '@prisma/client';
import { google } from 'googleapis';
import type { gmail_v1 } from 'googleapis';
import { EmailsService } from '../emails/emails.service';
import { AIService } from '../ai/ai.service';
import { SlackService } from '../slack/slack.service';

@Injectable()
export class GmailService {
  private readonly logger = new Logger(GmailService.name);

  constructor(
    private readonly emailsService: EmailsService,
    private readonly aiService: AIService,
    private readonly configService: ConfigService,
    private readonly slackService: SlackService,
  ) {}

  @Cron('*/5 * * * *')
  async syncEmails(): Promise<void> {
    this.logger.log('Gmail sync started...');
    try {
      const count = await this.fetchNewEmails();
      this.logger.log(`Gmail sync complete: ${count} new email(s)`);
    } catch (error) {
      this.logger.error('Gmail sync failed', (error as Error).stack);
    }
  }

  private buildGmailClient() {
    const auth = new google.auth.OAuth2(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
      this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
    );
    auth.setCredentials({
      refresh_token: this.configService.get<string>('GMAIL_REFRESH_TOKEN'),
    });
    return google.gmail({ version: 'v1', auth });
  }

  private async fetchNewEmails(): Promise<number> {
    const refreshToken = this.configService.get<string>('GMAIL_REFRESH_TOKEN');
    if (!refreshToken) {
      this.logger.warn('GMAIL_REFRESH_TOKEN not set — skipping Gmail fetch');
      return 0;
    }

    const gmail = this.buildGmailClient();

    const listRes = await gmail.users.messages.list({
      userId: 'me',
      q: 'is:unread in:inbox',
      maxResults: 50,
    });

    const messages = listRes.data.messages ?? [];
    let created = 0;

    for (const msg of messages) {
      if (!msg.id) continue;
      if (await this.emailsService.existsByGmailId(msg.id)) continue;

      const fullMsg = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id,
        format: 'full',
      });

      const emailData = this.parseMessage(msg.id, fullMsg.data);
      if (emailData) {
        const email = await this.emailsService.create(emailData);
        created++;
        this.logger.log(`Email imported: ${msg.id}`);

        // Trigger AI analysis asynchronously — don't block the sync loop
        this.aiService.analyzeEmail(email).then(async (analysis) => {
          await this.emailsService.update(email.id, {
            status: 'AWAITING_VALIDATION',
            aiSummary: analysis.summary,
            aiReply: analysis.suggestedReply,
            aiConfidence: analysis.confidence,
            priority: analysis.priority,
            category: analysis.category,
          });

          if (analysis.priority === 'HIGH') {
            await this.slackService.notifyHighPriority({
              id: email.id,
              fromName: email.fromName,
              fromEmail: email.fromEmail,
              subject: email.subject,
              category: analysis.category,
              aiSummary: analysis.summary,
            });
          }
        }).catch((err: Error) =>
          this.logger.error(`AI analysis failed for email ${email.id}`, err.stack)
        );
      }
    }

    return created;
  }

  private parseMessage(gmailId: string, msg: gmail_v1.Schema$Message) {
    const headers = msg.payload?.headers ?? [];

    const getHeader = (name: string) =>
      headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ?? '';

    const fromHeader = getHeader('from');
    const subject = getHeader('subject') || '(no subject)';
    const dateHeader = getHeader('date');

    const { name: fromName, email: fromEmail } = this.parseFromHeader(fromHeader);
    const bodyHtml = this.extractBody(msg.payload) || '<p>(no content)</p>';

    if (!fromEmail) return null;

    return {
      gmailId,
      fromName,
      fromEmail,
      subject,
      bodyHtml,
      receivedAt: dateHeader ? new Date(dateHeader) : new Date(),
      status: 'PENDING' as const,
      priority: Priority.MEDIUM,
      category: Category.OTHER,
    };
  }

  private parseFromHeader(from: string): { name: string; email: string } {
    const match = from.match(/^"?([^"<]*)"?\s*<([^>]+)>/);
    if (match) {
      return { name: match[1].trim() || match[2], email: match[2].trim() };
    }
    return { name: from.trim(), email: from.trim() };
  }

  private extractBody(payload: gmail_v1.Schema$MessagePart | undefined): string {
    if (!payload) return '';

    if (payload.mimeType === 'text/html' && payload.body?.data) {
      return Buffer.from(payload.body.data, 'base64').toString('utf8');
    }

    if (payload.mimeType === 'text/plain' && payload.body?.data) {
      const text = Buffer.from(payload.body.data, 'base64').toString('utf8');
      return `<p>${text.replace(/\n/g, '<br>')}</p>`;
    }

    if (payload.parts) {
      // Prefer HTML
      const htmlPart = payload.parts.find((p) => p.mimeType === 'text/html');
      if (htmlPart?.body?.data) {
        return Buffer.from(htmlPart.body.data, 'base64').toString('utf8');
      }
      // Recurse into nested multipart
      for (const part of payload.parts) {
        const body = this.extractBody(part);
        if (body) return body;
      }
    }

    return '';
  }

  async sendReply(
    gmailId: string,
    replyBody: string,
    subject: string,
  ): Promise<void> {
    const refreshToken = this.configService.get<string>('GMAIL_REFRESH_TOKEN');
    if (!refreshToken) {
      this.logger.warn('GMAIL_REFRESH_TOKEN not set — cannot send reply');
      return;
    }

    const gmail = this.buildGmailClient();

    const original = await gmail.users.messages.get({
      userId: 'me',
      id: gmailId,
      format: 'metadata',
      metadataHeaders: ['From', 'Message-ID'],
    });

    const headers = original.data.payload?.headers ?? [];
    const getHeader = (name: string) =>
      headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ?? '';

    const toAddress = getHeader('from');
    const messageId = getHeader('message-id');
    const threadId = original.data.threadId;
    const replySubject = subject.startsWith('Re:') ? subject : `Re: ${subject}`;

    const rawMessage = [
      `To: ${toAddress}`,
      `Subject: ${replySubject}`,
      `In-Reply-To: ${messageId}`,
      `References: ${messageId}`,
      'Content-Type: text/plain; charset=utf-8',
      '',
      replyBody,
    ].join('\r\n');

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: Buffer.from(rawMessage).toString('base64url'),
        threadId: threadId ?? undefined,
      },
    });

    this.logger.log(`Reply sent for Gmail message ${gmailId}`);
  }
}
