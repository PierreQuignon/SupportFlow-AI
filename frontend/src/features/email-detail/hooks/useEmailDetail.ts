import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/lib/queryKeys';
import { emailDetailService } from '../services/email-detail.service';

export const useEmailDetail = (id: string) =>
  useQuery({
    queryKey: queryKeys.emails.detail(id),
    queryFn: () => emailDetailService.getEmail(id),
    staleTime: 30_000,
    enabled: !!id,
  });

export const useRegenerateReply = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => emailDetailService.regenerate(id),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.emails.detail(id), data);
    },
  });
};

export const useValidateEmail = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sentReply: string) =>
      emailDetailService.validateAndSend(id, sentReply),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.emails.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.emails.lists() });
    },
  });
};

export const useUpdateReply = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (aiReply: string) =>
      emailDetailService.updateReply(id, aiReply),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.emails.detail(id), data);
    },
  });
};
