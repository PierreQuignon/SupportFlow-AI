import { ConfigService } from '@nestjs/config';
import { z } from 'zod';
import { Email } from '@prisma/client';
declare const aiAnalysisSchema: z.ZodObject<{
    summary: z.ZodString;
    category: z.ZodEnum<{
        REFUND: "REFUND";
        DELIVERY_ISSUE: "DELIVERY_ISSUE";
        TECHNICAL: "TECHNICAL";
        BILLING: "BILLING";
        OTHER: "OTHER";
    }>;
    priority: z.ZodEnum<{
        HIGH: "HIGH";
        MEDIUM: "MEDIUM";
        LOW: "LOW";
    }>;
    confidence: z.ZodNumber;
    suggestedReply: z.ZodString;
}, z.core.$strip>;
export type AIAnalysis = z.infer<typeof aiAnalysisSchema>;
export declare class AIService {
    private readonly configService;
    private readonly logger;
    private readonly client;
    constructor(configService: ConfigService);
    analyzeEmail(email: Email): Promise<AIAnalysis>;
    private parseResponse;
    private stripHtml;
}
export {};
