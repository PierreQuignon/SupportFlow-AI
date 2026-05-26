import { Skeleton, TableCell, TableRow } from '@mui/material';

export const EmailListSkeleton = () => (
  <>
    {Array.from({ length: 8 }).map((_, i) => (
      <TableRow key={i}>
        <TableCell><Skeleton variant="text" width={140} /></TableCell>
        <TableCell><Skeleton variant="text" width={260} /></TableCell>
        <TableCell><Skeleton variant="rounded" width={70} height={24} /></TableCell>
        <TableCell><Skeleton variant="rounded" width={60} height={24} /></TableCell>
        <TableCell><Skeleton variant="rounded" width={100} height={24} /></TableCell>
        <TableCell><Skeleton variant="text" width={90} /></TableCell>
      </TableRow>
    ))}
  </>
);
