'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import {
  Alert,
  Box,
  Button,
  Divider,
  Grid,
  Skeleton,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DOMPurify from 'dompurify';
import { useEmailDetail } from '@/features/email-detail/hooks/useEmailDetail';
import { AISummary } from '@/features/email-detail/components/AISummary';
import { AIReplyEditor } from '@/features/email-detail/components/AIReplyEditor';
import { ConversationThread } from '@/features/email-detail/components/ConversationThread';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EmailDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { data: email, isLoading, isError } = useEmailDetail(id);

  if (isError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Email not found.</Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/inbox')}
          size="small"
        >
          Back
        </Button>
        <Divider orientation="vertical" flexItem />
        {isLoading ? (
          <Skeleton width={300} height={28} />
        ) : (
          <Typography variant="h6" sx={{ fontWeight: 600 }} noWrap>
            {email?.subject}
          </Typography>
        )}
      </Box>

      {/* Split view 60/40 */}
      <Grid container spacing={3}>
        {/* Left — email body + conversation */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Box
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              p: 2.5,
              mb: 2,
              bgcolor: 'background.paper',
            }}
          >
            {isLoading ? (
              <>
                <Skeleton width="60%" height={24} sx={{ mb: 1 }} />
                <Skeleton width="40%" height={20} sx={{ mb: 2 }} />
                <Skeleton variant="rectangular" height={200} />
              </>
            ) : (
              <>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {email?.fromName}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                  {email?.fromEmail} ·{' '}
                  {new Date(email?.receivedAt ?? '').toLocaleString('fr-FR')}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(email?.bodyHtml ?? '', {
                      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'blockquote', 'div', 'span'],
                      ALLOWED_ATTR: ['href', 'target'],
                    }),
                  }}
                  sx={{ fontSize: 14, lineHeight: 1.7, '& a': { color: 'primary.main' } }}
                />
              </>
            )}
          </Box>

          {email && <ConversationThread messages={email.messages} />}
        </Grid>

        {/* Right — AI panel */}
        <Grid size={{ xs: 12, md: 5 }}>
          {isLoading ? (
            <>
              <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 1, mb: 2 }} />
              <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 1 }} />
            </>
          ) : email ? (
            <>
              <AISummary email={email} isLoading={isLoading} />
              <AIReplyEditor email={email} isLoading={isLoading} />
            </>
          ) : null}
        </Grid>
      </Grid>
    </Box>
  );
}
