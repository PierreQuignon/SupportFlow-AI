import api from '@/shared/lib/axios';
import type { EmailDetail } from '../types';

export const emailDetailService = {
  getEmail: (id: string): Promise<EmailDetail> =>
    api.get(`/emails/${id}`).then((r) => r.data),

  updateReply: (id: string, aiReply: string): Promise<EmailDetail> =>
    api.patch(`/emails/${id}`, { aiReply }).then((r) => r.data),

  validateAndSend: (id: string, sentReply: string): Promise<EmailDetail> =>
    api.patch(`/emails/${id}`, { status: 'PROCESSED', sentReply }).then((r) => r.data),

  regenerate: (id: string): Promise<EmailDetail> =>
    api.post(`/emails/${id}/regenerate`).then((r) => r.data),
};
