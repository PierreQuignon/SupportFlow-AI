'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import { useQueryClient } from '@tanstack/react-query';
import { useEmails, usePendingCount, useBulkDeleteEmails } from '@/features/inbox/hooks/useEmails';
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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data, isLoading, isFetching } = useEmails(filters);
  const { data: pendingCount } = usePendingCount();
  const { mutate: bulkDelete, isPending: isDeleting } = useBulkDeleteEmails();

  const emails = data?.data ?? [];

  const handleRefresh = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.emails.all });
  };

  const handleStatusFilter = (status: EmailStatus | undefined) => {
    setFilters((f) => ({ ...f, status, page: 1 }));
    setSelectedIds(new Set());
  };

  const handlePageChange = (page: number) => {
    setFilters((f) => ({ ...f, page }));
    setSelectedIds(new Set());
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    if (emails.every((e) => selectedIds.has(e.id))) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(emails.map((e) => e.id)));
    }
  };

  const handleConfirmDelete = () => {
    bulkDelete(Array.from(selectedIds), {
      onSuccess: () => {
        setSelectedIds(new Set());
        setConfirmOpen(false);
      },
    });
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
            <Button
              size="small"
              startIcon={isFetching ? <CircularProgress size={14} /> : <RefreshIcon />}
              onClick={handleRefresh}
              disabled={isFetching}
            >
              Refresh
            </Button>
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

      {/* Bulk action toolbar */}
      {selectedIds.size > 0 && (
        <Stack
          direction="row"
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1,
            mb: 1,
            bgcolor: 'primary.50',
            border: '1px solid',
            borderColor: 'primary.200',
            borderRadius: 1,
          }}
        >
          <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {selectedIds.size} email{selectedIds.size > 1 ? 's' : ''} selected
            </Typography>
          </Stack>
          <Stack direction="row" sx={{ gap: 1 }}>
            <Button
              size="small"
              startIcon={<CloseIcon />}
              onClick={() => setSelectedIds(new Set())}
            >
              Clear
            </Button>
            <Button
              size="small"
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setConfirmOpen(true)}
            >
              Delete ({selectedIds.size})
            </Button>
          </Stack>
        </Stack>
      )}

      {/* Email list */}
      <EmailList
        emails={emails}
        total={data?.total ?? 0}
        page={filters.page ?? 1}
        limit={filters.limit ?? 20}
        isLoading={isLoading}
        selectedIds={selectedIds}
        onSelect={(id) => router.push(`/inbox/${id}`)}
        onToggleSelect={handleToggleSelect}
        onToggleSelectAll={handleToggleSelectAll}
        onPageChange={handlePageChange}
      />

      {/* Confirmation dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Delete {selectedIds.size} email{selectedIds.size > 1 ? 's' : ''}?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This action is permanent. The selected emails will be removed from SupportFlow AI and cannot be recovered.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={14} /> : <DeleteIcon />}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
