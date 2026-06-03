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
var SlackService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlackService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let SlackService = SlackService_1 = class SlackService {
    configService;
    logger = new common_1.Logger(SlackService_1.name);
    constructor(configService) {
        this.configService = configService;
    }
    async notifyHighPriority(email) {
        const webhookUrl = this.configService.get('SLACK_WEBHOOK_URL');
        if (!webhookUrl) {
            this.logger.warn('SLACK_WEBHOOK_URL not set — skipping Slack notification');
            return;
        }
        const appUrl = this.configService.get('APP_URL') ?? 'http://localhost:3000';
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
        }
        catch (error) {
            this.logger.error('Slack notification failed', error.stack);
        }
    }
};
exports.SlackService = SlackService;
exports.SlackService = SlackService = SlackService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SlackService);
//# sourceMappingURL=slack.service.js.map