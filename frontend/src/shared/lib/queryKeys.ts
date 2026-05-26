export const queryKeys = {
  emails: {
    all: ['emails'] as const,
    lists: () => [...queryKeys.emails.all, 'list'] as const,
    list: (filters: Record<string, unknown>) =>
      [...queryKeys.emails.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.emails.all, 'detail', id] as const,
    pendingCount: () => [...queryKeys.emails.all, 'pending-count'] as const,
  },
};
