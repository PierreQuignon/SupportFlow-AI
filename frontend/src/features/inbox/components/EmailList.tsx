import {
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
  onSelect: (id: string) => void;
  onPageChange: (page: number) => void;
}

const COLUMNS = ['From', 'Subject', 'Category', 'Priority', 'Status', 'Received'];

export const EmailList = ({
  emails,
  total,
  page,
  limit,
  isLoading,
  onSelect,
  onPageChange,
}: EmailListProps) => (
  <Paper variant="outlined">
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: 'background.default' }}>
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
              <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                <Typography color="text.secondary">No emails found</Typography>
              </TableCell>
            </TableRow>
          ) : (
            emails.map((email) => (
              <EmailRow key={email.id} email={email} onSelect={onSelect} />
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
