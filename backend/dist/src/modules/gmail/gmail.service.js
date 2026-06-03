"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var GmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const client_1 = require("@prisma/client");
const googleapis_1 = require("googleapis");
const emails_service_1 = require("../emails/emails.service");
const ai_service_1 = require("../ai/ai.service");
const slack_service_1 = require("../slack/slack.service");
let GmailService = GmailService_1 = class GmailService {
    emailsService;
    aiService;
    configService;
    slackService;
    logger = new common_1.Logger(GmailService_1.name);
    constructor(emailsService, aiService, configService, slackService) {
        this.emailsService = emailsService;
        this.aiService = aiService;
        this.configService = configService;
        this.slackService = slackService;
    }
    async syncEmails() {
        this.logger.log('Gmail sync started...');
        try {
            const count = await this.fetchNewEmails();
            this.logger.log(`Gmail sync complete: ${count} new email(s)`);
        }
        catch (error) {
            this.logger.error('Gmail sync failed', error.stack);
        }
    }
    buildGmailClient() {
        const auth = new googleapis_1.google.auth.OAuth2(this.configService.get('GOOGLE_CLIENT_ID'), this.configService.get('GOOGLE_CLIENT_SECRET'));
        auth.setCredentials({
            refresh_token: this.configService.get('GMAIL_REFRESH_TOKEN'),
        });
        return googleapis_1.google.gmail({ version: 'v1', auth });
    }
    async fetchNewEmails() {
        const refreshToken = this.configService.get('GMAIL_REFRESH_TOKEN');
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
            if (!msg.id)
                continue;
            if (await this.emailsService.existsByGmailId(msg.id))
                continue;
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
                }).catch((err) => this.logger.error(`AI analysis failed for email ${email.id}`, err.stack));
            }
        }
        return created;
    }
    parseMessage(gmailId, msg) {
        const headers = msg.payload?.headers ?? [];
        const getHeader = (name) => headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ?? '';
        const fromHeader = getHeader('from');
        const subject = getHeader('subject') || '(no subject)';
        const dateHeader = getHeader('date');
        const { name: fromName, email: fromEmail } = this.parseFromHeader(fromHeader);
        const bodyHtml = this.extractBody(msg.payload) || '<p>(no content)</p>';
        if (!fromEmail)
            return null;
        return {
            gmailId,
            fromName,
            fromEmail,
            subject,
            bodyHtml,
            receivedAt: dateHeader ? new Date(dateHeader) : new Date(),
            status: 'PENDING',
            priority: client_1.Priority.MEDIUM,
            category: client_1.Category.OTHER,
        };
    }
    parseFromHeader(from) {
        const match = from.match(/^"?([^"<]*)"?\s*<([^>]+)>/);
        if (match) {
            return { name: match[1].trim() || match[2], email: match[2].trim() };
        }
        return { name: from.trim(), email: from.trim() };
    }
    extractBody(payload) {
        if (!payload)
            return '';
        if (payload.mimeType === 'text/html' && payload.body?.data) {
            return Buffer.from(payload.body.data, 'base64').toString('utf8');
        }
        if (payload.mimeType === 'text/plain' && payload.body?.data) {
            const text = Buffer.from(payload.body.data, 'base64').toString('utf8');
            return `<p>${text.replace(/\n/g, '<br>')}</p>`;
        }
        if (payload.parts) {
            const htmlPart = payload.parts.find((p) => p.mimeType === 'text/html');
            if (htmlPart?.body?.data) {
                return Buffer.from(htmlPart.body.data, 'base64').toString('utf8');
            }
            for (const part of payload.parts) {
                const body = this.extractBody(part);
                if (body)
                    return body;
            }
        }
        return '';
    }
    async sendReply(gmailId, replyBody, subject) {
        const refreshToken = this.configService.get('GMAIL_REFRESH_TOKEN');
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
        const getHeader = (name) => headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ?? '';
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
};
exports.GmailService = GmailService;
__decorate([
    (0, schedule_1.Cron)('*/5 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GmailService.prototype, "syncEmails", null);
exports.GmailService = GmailService = GmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [emails_service_1.EmailsService,
        ai_service_1.AIService,
        config_1.ConfigService,
        slack_service_1.SlackService])
], GmailService);
//# sourceMappingURL=gmail.service.js.map