'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useQueryClient } from '@tanstack/react-query';
import { useEmails, usePendingCount } from '@/features/inbox/hooks/useEmails';
import { EmailList } from '@/features/inbox/components/EmailList';
import { queryKeys } from '@/shared/lib/queryKeys';
import type { EmailFilters, EmailStatus } from '@/features/inbox/types';

const STATUS_FILTERS: { label: string; value: EmailStatus | undefined }[] = [
  { label: 'All', value: undefined },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Awaiting validation', value: 'AWAITING_VALIDATION' },
  { label: 'Processed', value: 'PROCESSED' },
];

export default function InboxPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<EmailFilters>({ page: 1, limit: 20 });

  const { data, isLoading, isFetching } = useEmails(filters);
  const { data: pendingCount } = usePendingCount();

  const handleRefresh = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.emails.all });
  };

  const handleStatusFilter = (status: EmailStatus | undefined) => {
    setFilters((f) => ({ ...f, status, page: 1 }));
  };

  return (
    <Box>
      {/* Header */}
      <Stack
        direction="row"
        sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 3 }}
      >
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Inbox
          </Typography>
          {pendingCount !== undefined && pendingCount > 0 && (
            <Chip label={`${pendingCount} pending`} color="warning" size="small" />
          )}
        </Stack>

        <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
          <Chip label="Gmail connected" color="success" size="small" variant="outlined" />
          <Tooltip title="Refresh">
            <Button
              size="small"
              startIcon={isFetching ? <CircularProgress size={14} /> : <RefreshIcon />}
              onClick={handleRefresh}
              disabled={isFetching}
            >
              Refresh
            </Button>
          </Tooltip>
        </Stack>
      </Stack>

      {/* Status filter chips */}
      <Stack direction="row" sx={{ gap: 1, mb: 2 }}>
        {STATUS_FILTERS.map(({ label, value }) => (
          <Chip
            key={label}
            label={label}
            onClick={() => handleStatusFilter(value)}
            color={filters.status === value ? 'primary' : 'default'}
            variant={filters.status === value ? 'filled' : 'outlined'}
            size="small"
            clickable
          />
        ))}
      </Stack>

      {/* Email list */}
      <EmailList
        emails={data?.data ?? []}
        total={data?.total ?? 0}
        page={filters.page ?? 1}
        limit={filters.limit ?? 20}
        isLoading={isLoading}
        onSelect={(id) => router.push(`/inbox/${id}`)}
        onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
      />
    </Box>
  );
}
