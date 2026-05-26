import {
  Box,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material';
import { StatusBadge, PriorityBadge, CategoryBadge } from './StatusBadge';
import type { EmailListItem } from '../types';

interface EmailRowProps {
  email: EmailListItem;
  onSelect: (id: string) => void;
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

export const EmailRow = ({ email, onSelect }: EmailRowProps) => (
  <TableRow
    hover
    onClick={() => onSelect(email.id)}
    sx={{
      cursor: 'pointer',
      borderLeft: email.priority === 'HIGH' ? '3px solid' : '3px solid transparent',
      borderLeftColor: email.priority === 'HIGH' ? 'error.main' : 'transparent',
    }}
  >
    <TableCell>
      <Typography variant="body2" sx={{ fontWeight: email.status === 'PENDING' ? 700 : 400 }}>
        {email.fromName}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {email.fromEmail}
      </Typography>
    </TableCell>

    <TableCell>
      <Typography variant="body2" sx={{ fontWeight: email.status === 'PENDING' ? 700 : 400 }} noWrap>
        {email.subject}
      </Typography>
      {email.aiSummary && (
        <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', maxWidth: 400 }}>
          {email.aiSummary}
        </Typography>
      )}
    </TableCell>

    <TableCell>
      <CategoryBadge category={email.category} />
    </TableCell>

    <TableCell>
      <PriorityBadge priority={email.priority} />
    </TableCell>

    <TableCell>
      <StatusBadge status={email.status} />
    </TableCell>

    <TableCell>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="caption" color="text.secondary">
          {formatDate(email.receivedAt)}
        </Typography>
      </Box>
    </TableCell>
  </TableRow>
);
