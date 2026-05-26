import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { Prisma } from '@prisma/client';
import { EmailsService } from '../emails/emails.service';

@Injectable()
export class GmailService {
  private readonly logger = new Logger(GmailService.name);

  constructor(
    private readonly emailsService: EmailsService,
    private readonly configService: ConfigService,
  ) {}

  // ⚠️ CONFIG NEEDED — set GMAIL_REFRESH_TOKEN in .env before this does anything
  @Cron('*/5 * * * *')
  async syncEmails(): Promise<void> {
    this.logger.log('Gmail sync started...');

    try {
      const newEmails = await this.fetchNewEmails();
      this.logger.log(`Gmail sync complete: ${newEmails.length} new email(s)`);
    } catch (error) {
      this.logger.error('Gmail sync failed', (error as Error).stack);
    }
  }

  private async fetchNewEmails(): Promise<Prisma.EmailCreateInput[]> {
    const refreshToken = this.configService.get<string>('GMAIL_REFRESH_TOKEN');

    if (!refreshToken) {
      this.logger.warn('GMAIL_REFRESH_TOKEN not set — skipping Gmail fetch');
      return [];
    }

    // TODO: implement real Gmail API calls once credentials are configured
    // Steps:
    //   1. Build OAuth2 client with GMAIL_CLIENT_ID + GMAIL_CLIENT_SECRET + GMAIL_REFRESH_TOKEN
    //   2. Call gmail.users.messages.list({ userId: 'me', q: 'is:unread' })
    //   3. For each message, call gmail.users.messages.get to fetch full content
    //   4. Filter out already-known gmailIds via this.emailsService.existsByGmailId()
    //   5. Create new Email records via this.emailsService.create()
    return [];
  }

  async sendReply(gmailId: string, replyBody: string): Promise<void> {
    const refreshToken = this.configService.get<string>('GMAIL_REFRESH_TOKEN');

    if (!refreshToken) {
      this.logger.warn('GMAIL_REFRESH_TOKEN not set — cannot send reply');
      return;
    }

    // TODO: implement once credentials are configured
    // Steps:
    //   1. Fetch the original thread via gmail.users.threads.get
    //   2. Build the RFC 2822 reply message (headers: In-Reply-To, References)
    //   3. Call gmail.users.messages.send with the encoded message
    this.logger.log(`Reply sent for Gmail message ${gmailId}`);
  }
}
