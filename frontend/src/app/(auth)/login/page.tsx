'use client';

import { signIn } from 'next-auth/react';
import { Button, Box, Typography, Paper } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { SupportFlowLogo } from '@/shared/theme/icons/supportFlowLogo';

export default function LoginPage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Paper elevation={3} sx={{ p: 6, textAlign: 'center', maxWidth: 800, width: '100%'}}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <SupportFlowLogo width={700} />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Connectez-vous pour accéder à votre inbox
        </Typography>
        <Button
          variant="contained"
          startIcon={<GoogleIcon />}
          onClick={() => signIn('google', { callbackUrl: '/inbox' })}
          size="large"
        >
          Continuer avec Google
        </Button>
      </Paper>
    </Box>
  );
}
