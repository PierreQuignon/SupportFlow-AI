import { Email, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { GetEmailsDto } from './dto/get-emails.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
export interface PaginatedEmails {
    data: Omit<Email, 'bodyHtml' | 'sentReply'>[];
    total: number;
    page: number;
    limit: number;
}
export declare class EmailsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(dto: GetEmailsDto): Promise<PaginatedEmails>;
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
    create(data: Prisma.EmailCreateInput): Promise<Email>;
    update(id: string, dto: UpdateEmailDto): Promise<Email>;
    countPending(): Promise<number>;
    existsByGmailId(gmailId: string): Promise<boolean>;
    bulkDelete(ids: string[]): Promise<{
        deleted: number;
    }>;
}
