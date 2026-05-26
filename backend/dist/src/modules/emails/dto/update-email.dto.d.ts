import { EmailStatus, Priority, Category } from '@prisma/client';
export declare class UpdateEmailDto {
    status?: EmailStatus;
    priority?: Priority;
    category?: Category;
    aiSummary?: string;
    aiReply?: string;
    aiConfidence?: number;
    sentReply?: string;
}
