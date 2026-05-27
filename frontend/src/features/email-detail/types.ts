import type { EmailStatus, Priority, Category } from '@/features/inbox/types';

export type { EmailStatus, Priority, Category };

export interface Message {
  id: string;
  emailId: string;
  role: 'CLIENT' | 'SUPPORT';
  content: string;
  sentAt: string;
}

export interface EmailDetail {
  id: string;
  gmailId: string;
  fromName: string;
  fromEmail: string;
  subject: string;
  bodyHtml: string;
  receivedAt: string;
  status: EmailStatus;
  priority: Priority;
  category: Category;
  aiSummary: string | null;
  aiReply: string | null;
  aiConfidence: number | null;
  sentReply: string | null;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}
