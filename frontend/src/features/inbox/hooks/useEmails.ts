import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/lib/queryKeys';
import { inboxService } from '../services/inbox.service';
import type { EmailFilters } from '../types';

export const useEmails = (filters: EmailFilters = {}) =>
  useQuery({
    queryKey: queryKeys.emails.list(filters as Record<string, unknown>),
    queryFn: () => inboxService.getEmails(filters),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });

export const usePendingCount = () =>
  useQuery({
    queryKey: queryKeys.emails.pendingCount(),
    queryFn: inboxService.getPendingCount,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

export const useBulkDeleteEmails = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => inboxService.bulkDelete(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.emails.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.emails.pendingCount() });
    },
  });
};
