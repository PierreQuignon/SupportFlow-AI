import { ConfigService } from '@nestjs/config';
import { EmailsService } from '../emails/emails.service';
import { AIService } from '../ai/ai.service';
import { SlackService } from '../slack/slack.service';
export declare class GmailService {
    private readonly emailsService;
    private readonly aiService;
    private readonly configService;
    private readonly slackService;
    private readonly logger;
    constructor(emailsService: EmailsService, aiService: AIService, configService: ConfigService, slackService: SlackService);
    syncEmails(): Promise<void>;
    private buildGmailClient;
    private fetchNewEmails;
    private parseMessage;
    private parseFromHeader;
    private extractBody;
    sendReply(gmailId: string, replyBody: string, subject: string): Promise<void>;
}
