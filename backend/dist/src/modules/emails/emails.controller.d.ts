import { EmailsService } from './emails.service';
import { AIService } from '../ai/ai.service';
import { GmailService } from '../gmail/gmail.service';
import { GetEmailsDto } from './dto/get-emails.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
export declare class EmailsController {
    private readonly emailsService;
    private readonly aiService;
    private readonly gmailService;
    constructor(emailsService: EmailsService, aiService: AIService, gmailService: GmailService);
    findAll(dto: GetEmailsDto): Promise<import("./emails.service").PaginatedEmails>;
    countPending(): Promise<number>;
    findOne(id: string): Promise<{
        messages: {
            id: string;
            sentAt: Date;
            role: import("@prisma/client").$Enums.Role;
            content: string;
            emailId: string;
        }[];
    } & {
        status: import("@prisma/client").$Enums.EmailStatus;
        priority: import("@prisma/client").$Enums.Priority;
        category: import("@prisma/client").$Enums.Category;
        aiSummary: string | null;
        aiReply: string | null;
        aiConfidence: number | null;
        sentReply: string | null;
        id: string;
        gmailId: string;
        fromName: string;
        fromEmail: string;
        subject: string;
        bodyHtml: string;
        receivedAt: Date;
        exportedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, dto: UpdateEmailDto): Promise<{
        status: import("@prisma/client").$Enums.EmailStatus;
        priority: import("@prisma/client").$Enums.Priority;
        category: import("@prisma/client").$Enums.Category;
        aiSummary: string | null;
        aiReply: string | null;
        aiConfidence: number | null;
        sentReply: string | null;
        id: string;
        gmailId: string;
        fromName: string;
        fromEmail: string;
        subject: string;
        bodyHtml: string;
        receivedAt: Date;
        exportedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    regenerate(id: string): Promise<{
        status: import("@prisma/client").$Enums.EmailStatus;
        priority: import("@prisma/client").$Enums.Priority;
        category: import("@prisma/client").$Enums.Category;
        aiSummary: string | null;
        aiReply: string | null;
        aiConfidence: number | null;
        sentReply: string | null;
        id: string;
        gmailId: string;
        fromName: string;
        fromEmail: string;
        subject: string;
        bodyHtml: string;
        receivedAt: Date;
        exportedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
