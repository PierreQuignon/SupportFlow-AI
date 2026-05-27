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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var AIService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const zod_1 = require("zod");
const analyze_email_prompt_1 = require("./prompts/analyze-email.prompt");
const aiAnalysisSchema = zod_1.z.object({
    summary: zod_1.z.string().max(500),
    category: zod_1.z.enum([
        'REFUND',
        'DELIVERY_ISSUE',
        'TECHNICAL',
        'BILLING',
        'OTHER',
    ]),
    priority: zod_1.z.enum(['HIGH', 'MEDIUM', 'LOW']),
    confidence: zod_1.z.number().min(0).max(1),
    suggestedReply: zod_1.z.string().max(5000),
});
let AIService = AIService_1 = class AIService {
    configService;
    logger = new common_1.Logger(AIService_1.name);
    client;
    constructor(configService) {
        this.configService = configService;
        this.client = new sdk_1.default({
            apiKey: this.configService.get('CLAUDE_API_KEY'),
        });
    }
    async analyzeEmail(email) {
        const prompt = (0, analyze_email_prompt_1.buildAnalyzeEmailPrompt)({
            fromName: email.fromName,
            fromEmail: email.fromEmail,
            subject: email.subject,
            body: this.stripHtml(email.bodyHtml),
        });
        try {
            const message = await this.client.messages.create({
                model: 'claude-sonnet-4-6',
                max_tokens: 1024,
                messages: [{ role: 'user', content: prompt }],
            });
            const raw = message.content[0].type === 'text' ? message.content[0].text : '';
            return this.parseResponse(raw);
        }
        catch (error) {
            this.logger.error(`AI analysis failed for email ${email.id}`, error.stack);
            throw new common_1.InternalServerErrorException('AI analysis unavailable');
        }
    }
    parseResponse(raw) {
        let parsed;
        try {
            const jsonMatch = raw.match(/\{[\s\S]*\}/);
            parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
        }
        catch {
            this.logger.warn('Claude returned invalid JSON', raw);
            throw new common_1.InternalServerErrorException('AI response parsing failed');
        }
        const result = aiAnalysisSchema.safeParse(parsed);
        if (!result.success) {
            this.logger.warn('Claude response failed schema validation', result.error.message);
            throw new common_1.InternalServerErrorException('AI response schema invalid');
        }
        return result.data;
    }
    stripHtml(html) {
        return html
            .replace(/<[^>]*>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 4000);
    }
};
exports.AIService = AIService;
exports.AIService = AIService = AIService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AIService);
//# sourceMappingURL=ai.service.js.map