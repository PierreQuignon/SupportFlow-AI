import { Box, Paper, Typography } from '@mui/material';
import type { Message } from '../types';

interface ConversationThreadProps {
  messages: Message[];
}

const formatTime = (iso: string) =>
  new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

export const ConversationThread = ({ messages }: ConversationThreadProps) => {
  if (!messages || messages.length === 0) return null;

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
        Conversation history
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {messages.map((msg) => (
          <Box
            key={msg.id}
            sx={{
              display: 'flex',
              justifyContent: msg.role === 'SUPPORT' ? 'flex-end' : 'flex-start',
            }}
          >
            <Paper
              variant="outlined"
              sx={{
                p: 1.5,
                maxWidth: '80%',
                bgcolor: msg.role === 'SUPPORT' ? 'primary.main' : 'background.paper',
                color: msg.role === 'SUPPORT' ? 'primary.contrastText' : 'text.primary',
                borderRadius: msg.role === 'SUPPORT' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
              }}
            >
              <Typography variant="body2">{msg.content}</Typography>
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  mt: 0.5,
                  opacity: 0.7,
                  textAlign: msg.role === 'SUPPORT' ? 'right' : 'left',
                }}
              >
                {formatTime(msg.sentAt)}
              </Typography>
            </Paper>
          </Box>
        ))}
      </Box>
    </Box>
  );
};
