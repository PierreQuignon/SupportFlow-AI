import {
  Checkbox,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
} from '@mui/material';
import { EmailRow } from './EmailRow';
import { EmailListSkeleton } from './EmailListSkeleton';
import type { EmailListItem } from '../types';

interface EmailListProps {
  emails: EmailListItem[];
  total: number;
  page: number;
  limit: number;
  isLoading: boolean;
  selectedIds: Set<string>;
  onSelect: (id: string) => void;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onPageChange: (page: number) => void;
}

const COLUMNS = ['From', 'Subject', 'Category', 'Priority', 'Status', 'Received'];

export const EmailList = ({
  emails,
  total,
  page,
  limit,
  isLoading,
  selectedIds,
  onSelect,
  onToggleSelect,
  onToggleSelectAll,
  onPageChange,
}: EmailListProps) => {
  const allSelected = emails.length > 0 && emails.every((e) => selectedIds.has(e.id));
  const someSelected = emails.some((e) => selectedIds.has(e.id)) && !allSelected;

  return (
    <Paper variant="outlined">
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'background.default' }}>
              <TableCell padding="checkbox">
                <Checkbox
                  size="small"
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={onToggleSelectAll}
                />
              </TableCell>
              {COLUMNS.map((col) => (
                <TableCell key={col}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }} color="text.secondary">
                    {col}
                  </Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <EmailListSkeleton />
            ) : emails.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">No emails found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              emails.map((email) => (
                <EmailRow
                  key={email.id}
                  email={email}
                  isSelected={selectedIds.has(email.id)}
                  onSelect={onSelect}
                  onToggleSelect={onToggleSelect}
                />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={total}
        page={page - 1}
        rowsPerPage={limit}
        rowsPerPageOptions={[20]}
        onPageChange={(_, newPage) => onPageChange(newPage + 1)}
      />
    </Paper>
  );
};
