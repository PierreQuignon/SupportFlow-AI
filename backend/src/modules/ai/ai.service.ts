import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { Email } from '@prisma/client';
import { buildAnalyzeEmailPrompt } from './prompts/analyze-email.prompt';

const aiAnalysisSchema = z.object({
  summary: z.string().max(500),
  category: z.enum([
    'REFUND',
    'DELIVERY_ISSUE',
    'TECHNICAL',
    'BILLING',
    'OTHER',
  ]),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  confidence: z.number().min(0).max(1),
  suggestedReply: z.string().max(5000),
});

export type AIAnalysis = z.infer<typeof aiAnalysisSchema>;

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  private readonly client: Anthropic;

  constructor(private readonly configService: ConfigService) {
    this.client = new Anthropic({
      apiKey: this.configService.get<string>('CLAUDE_API_KEY'),
    });
  }

  async analyzeEmail(email: Email): Promise<AIAnalysis> {
    const prompt = buildAnalyzeEmailPrompt({
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

      const raw =
        message.content[0].type === 'text' ? message.content[0].text : '';
      return this.parseResponse(raw);
    } catch (error) {
      this.logger.error(
        `AI analysis failed for email ${email.id}`,
        (error as Error).stack,
      );
      throw new InternalServerErrorException('AI analysis unavailable');
    }
  }

  private parseResponse(raw: string): AIAnalysis {
    let parsed: unknown;

    try {
      // Extract JSON block in case the model adds surrounding text
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
    } catch {
      this.logger.warn('Claude returned invalid JSON', raw);
      throw new InternalServerErrorException('AI response parsing failed');
    }

    const result = aiAnalysisSchema.safeParse(parsed);
    if (!result.success) {
      this.logger.warn(
        'Claude response failed schema validation',
        result.error.message,
      );
      throw new InternalServerErrorException('AI response schema invalid');
    }

    return result.data;
  }

  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 4000);
  }
}
