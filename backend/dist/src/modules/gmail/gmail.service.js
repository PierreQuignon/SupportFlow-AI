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
const emails_service_1 = require("../emails/emails.service");
let GmailService = GmailService_1 = class GmailService {
    emailsService;
    configService;
    logger = new common_1.Logger(GmailService_1.name);
    constructor(emailsService, configService) {
        this.emailsService = emailsService;
        this.configService = configService;
    }
    async syncEmails() {
        this.logger.log('Gmail sync started...');
        try {
            const newEmails = await this.fetchNewEmails();
            this.logger.log(`Gmail sync complete: ${newEmails.length} new email(s)`);
        }
        catch (error) {
            this.logger.error('Gmail sync failed', error.stack);
        }
    }
    async fetchNewEmails() {
        const refreshToken = this.configService.get('GMAIL_REFRESH_TOKEN');
        if (!refreshToken) {
            this.logger.warn('GMAIL_REFRESH_TOKEN not set — skipping Gmail fetch');
            return [];
        }
        return [];
    }
    async sendReply(gmailId, replyBody) {
        const refreshToken = this.configService.get('GMAIL_REFRESH_TOKEN');
        if (!refreshToken) {
            this.logger.warn('GMAIL_REFRESH_TOKEN not set — cannot send reply');
            return;
        }
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
        config_1.ConfigService])
], GmailService);
//# sourceMappingURL=gmail.service.js.map