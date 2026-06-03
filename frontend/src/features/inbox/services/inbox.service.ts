import api from '@/shared/lib/axios';
import type { EmailFilters, PaginatedEmails } from '../types';

export const inboxService = {
  getEmails: (filters: EmailFilters): Promise<PaginatedEmails> =>
    api.get('/emails', { params: filters }).then((r) => r.data as PaginatedEmails),

  getPendingCount: (): Promise<number> =>
    api.get('/emails/pending-count').then((r) => r.data as number),

  bulkDelete: (ids: string[]): Promise<{ deleted: number }> =>
    api.delete('/emails', { data: { ids } }).then((r) => r.data as { deleted: number }),

  sync: (): Promise<{ synced: boolean }> =>
    api.post('/emails/sync').then((r) => r.data as { synced: boolean }),
};
