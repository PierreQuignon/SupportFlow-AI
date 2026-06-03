import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Query, forwardRef } from '@nestjs/common';
import { EmailStatus } from '@prisma/client';
import { EmailsService } from './emails.service';
import { AIService } from '../ai/ai.service';
import { GmailService } from '../gmail/gmail.service';
import { GetEmailsDto } from './dto/get-emails.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import { BulkDeleteEmailsDto } from './dto/bulk-delete-emails.dto';

@Controller('emails')
export class EmailsController {
  constructor(
    private readonly emailsService: EmailsService,
    private readonly aiService: AIService,
    @Inject(forwardRef(() => GmailService))
    private readonly gmailService: GmailService,
  ) {}

  @Get()
  findAll(@Query() dto: GetEmailsDto) {
    return this.emailsService.findAll(dto);
  }

  @Get('pending-count')
  countPending() {
    return this.emailsService.countPending();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.emailsService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateEmailDto) {
    if (dto.status === EmailStatus.PROCESSED && dto.sentReply) {
      const email = await this.emailsService.findOne(id);
      await this.gmailService.sendReply(email.gmailId, dto.sentReply, email.subject);
    }
    return this.emailsService.update(id, dto);
  }

  @Delete()
  bulkDelete(@Body() dto: BulkDeleteEmailsDto) {
    return this.emailsService.bulkDelete(dto.ids);
  }

  @Post(':id/regenerate')
  async regenerate(@Param('id') id: string) {
    const email = await this.emailsService.findOne(id);
    const analysis = await this.aiService.analyzeEmail(email);
    await this.emailsService.update(id, {
      aiReply: analysis.suggestedReply,
      aiSummary: analysis.summary,
      aiConfidence: analysis.confidence,
      priority: analysis.priority,
      category: analysis.category,
    });
    return this.emailsService.findOne(id);
  }
}
