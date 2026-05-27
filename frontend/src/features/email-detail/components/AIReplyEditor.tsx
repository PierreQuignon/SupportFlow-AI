'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Skeleton,
  TextField,
  Typography,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SendIcon from '@mui/icons-material/Send';
import { useRegenerateReply, useValidateEmail } from '../hooks/useEmailDetail';
import type { EmailDetail } from '../types';

const replySchema = z.object({
  replyContent: z.string().min(10, 'Reply must be at least 10 characters'),
});

type ReplyFormValues = z.infer<typeof replySchema>;

interface AIReplyEditorProps {
  email: EmailDetail;
  isLoading: boolean;
}

export const AIReplyEditor = ({ email, isLoading }: AIReplyEditorProps) => {
  const { mutate: regenerate, isPending: isRegenerating } = useRegenerateReply(email.id);
  const { mutate: validate, isPending: isValidating } = useValidateEmail(email.id);

  const { register, handleSubmit, reset, formState: { errors, isDirty } } =
    useForm<ReplyFormValues>({
      resolver: zodResolver(replySchema),
      defaultValues: { replyContent: email.aiReply ?? '' },
    });

  useEffect(() => {
    reset({ replyContent: email.aiReply ?? '' });
  }, [email.aiReply, reset]);

  const onSubmit = ({ replyContent }: ReplyFormValues) => {
    validate(replyContent);
  };

  const isProcessed = email.status === 'PROCESSED';

  return (
    <Paper variant="outlined" sx={{ p: 2.5 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
        Suggested reply
      </Typography>

      {isLoading || (!email.aiReply && email.status !== 'PROCESSED') ? (
        <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 1, mb: 2 }} />
      ) : isProcessed ? (
        <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1, mb: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
            Sent reply
          </Typography>
          <Typography variant="body2">{email.sentReply}</Typography>
        </Box>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField
            {...register('replyContent')}
            multiline
            rows={6}
            fullWidth
            error={!!errors.replyContent}
            helperText={errors.replyContent?.message}
            disabled={isValidating}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            {email.aiReply && (
              <Button
                size="small"
                startIcon={isRegenerating ? <CircularProgress size={14} /> : <RefreshIcon />}
                onClick={() => regenerate()}
                disabled={isRegenerating || isValidating}
              >
                Regenerate
              </Button>
            )}
            <Button
              type="submit"
              variant="contained"
              size="small"
              startIcon={isValidating ? <CircularProgress size={14} /> : <SendIcon />}
              disabled={isValidating || isRegenerating || (!isDirty && !email.aiReply)}
            >
              {isValidating ? 'Sending...' : 'Validate & send'}
            </Button>
          </Box>
        </form>
      )}
    </Paper>
  );
};
