import api from '@/shared/lib/axios';
import type { EmailFilters, PaginatedEmails } from '../types';

export const inboxService = {
  getEmails: (filters: EmailFilters): Promise<PaginatedEmails> =>
    api.get('/emails', { params: filters }).then((r) => r.data as PaginatedEmails),

  getPendingCount: (): Promise<number> =>
    api.get('/emails/pending-count').then((r) => r.data as number),
};
