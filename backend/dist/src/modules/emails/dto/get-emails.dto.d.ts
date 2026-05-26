import { EmailStatus, Priority, Category } from '@prisma/client';
export declare class GetEmailsDto {
    status?: EmailStatus;
    priority?: Priority;
    category?: Category;
    page?: number;
    limit?: number;
}
