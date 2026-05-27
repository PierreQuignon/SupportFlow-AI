'use client';

import { Box, Chip, LinearProgress, Paper, Skeleton, Typography } from '@mui/material';
import { CategoryBadge, PriorityBadge, StatusBadge } from '@/features/inbox/components/StatusBadge';
import type { EmailDetail } from '../types';

interface AISummaryProps {
  email: EmailDetail;
  isLoading: boolean;
}

export const AISummary = ({ email, isLoading }: AISummaryProps) => (
  <Paper variant="outlined" sx={{ p: 2.5, mb: 2 }}>
    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
      AI Analysis
    </Typography>

    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
      <StatusBadge status={email.status} />
      <PriorityBadge priority={email.priority} />
      <CategoryBadge category={email.category} />
    </Box>

    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
      Summary
    </Typography>
    {isLoading || !email.aiSummary ? (
      <Skeleton variant="text" width="100%" height={40} />
    ) : (
      <Typography variant="body2" sx={{ mb: 2 }}>
        {email.aiSummary}
      </Typography>
    )}

    {email.aiConfidence !== null && (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            Confidence
          </Typography>
          <Chip
            label={`${Math.round((email.aiConfidence ?? 0) * 100)}%`}
            size="small"
            color={email.aiConfidence >= 0.7 ? 'success' : 'warning'}
          />
        </Box>
        <LinearProgress
          variant="determinate"
          value={(email.aiConfidence ?? 0) * 100}
          color={email.aiConfidence >= 0.7 ? 'success' : 'warning'}
          sx={{ borderRadius: 1 }}
        />
      </Box>
    )}
  </Paper>
);
