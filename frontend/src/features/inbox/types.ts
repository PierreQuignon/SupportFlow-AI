export type EmailStatus = 'PENDING' | 'AWAITING_VALIDATION' | 'PROCESSED';
export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';
export type Category = 'REFUND' | 'DELIVERY_ISSUE' | 'TECHNICAL' | 'BILLING' | 'OTHER';

export interface EmailListItem {
  id: string;
  gmailId: string;
  fromName: string;
  fromEmail: string;
  subject: string;
  receivedAt: string;
  status: EmailStatus;
  priority: Priority;
  category: Category;
  aiSummary: string | null;
  aiConfidence: number | null;
  exportedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedEmails {
  data: EmailListItem[];
  total: number;
  page: number;
  limit: number;
}

export interface EmailFilters {
  status?: EmailStatus;
  priority?: Priority;
  category?: Category;
  page?: number;
  limit?: number;
}
