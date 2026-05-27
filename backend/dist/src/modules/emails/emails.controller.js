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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailsController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const emails_service_1 = require("./emails.service");
const ai_service_1 = require("../ai/ai.service");
const gmail_service_1 = require("../gmail/gmail.service");
const get_emails_dto_1 = require("./dto/get-emails.dto");
const update_email_dto_1 = require("./dto/update-email.dto");
let EmailsController = class EmailsController {
    emailsService;
    aiService;
    gmailService;
    constructor(emailsService, aiService, gmailService) {
        this.emailsService = emailsService;
        this.aiService = aiService;
        this.gmailService = gmailService;
    }
    findAll(dto) {
        return this.emailsService.findAll(dto);
    }
    countPending() {
        return this.emailsService.countPending();
    }
    findOne(id) {
        return this.emailsService.findOne(id);
    }
    async update(id, dto) {
        if (dto.status === client_1.EmailStatus.PROCESSED && dto.sentReply) {
            const email = await this.emailsService.findOne(id);
            await this.gmailService.sendReply(email.gmailId, dto.sentReply, email.subject);
        }
        return this.emailsService.update(id, dto);
    }
    async regenerate(id) {
        const email = await this.emailsService.findOne(id);
        const analysis = await this.aiService.analyzeEmail(email);
        return this.emailsService.update(id, {
            aiReply: analysis.suggestedReply,
            aiSummary: analysis.summary,
            aiConfidence: analysis.confidence,
            priority: analysis.priority,
            category: analysis.category,
        });
    }
};
exports.EmailsController = EmailsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_emails_dto_1.GetEmailsDto]),
    __metadata("design:returntype", void 0)
], EmailsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('pending-count'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EmailsController.prototype, "countPending", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EmailsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_email_dto_1.UpdateEmailDto]),
    __metadata("design:returntype", Promise)
], EmailsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/regenerate'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EmailsController.prototype, "regenerate", null);
exports.EmailsController = EmailsController = __decorate([
    (0, common_1.Controller)('emails'),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => gmail_service_1.GmailService))),
    __metadata("design:paramtypes", [emails_service_1.EmailsService,
        ai_service_1.AIService,
        gmail_service_1.GmailService])
], EmailsController);
//# sourceMappingURL=emails.controller.js.map