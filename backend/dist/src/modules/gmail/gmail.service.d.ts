import { ConfigService } from '@nestjs/config';
import { EmailsService } from '../emails/emails.service';
export declare class GmailService {
    private readonly emailsService;
    private readonly configService;
    private readonly logger;
    constructor(emailsService: EmailsService, configService: ConfigService);
    syncEmails(): Promise<void>;
    private fetchNewEmails;
    sendReply(gmailId: string, replyBody: string): Promise<void>;
}
