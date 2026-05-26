'use client';

import { AppBar, Toolbar, Typography, Box, Avatar, Tooltip, IconButton } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { useSession, signOut } from 'next-auth/react';

export default function TopBar() {
  const { data: session } = useSession();

  return (
    <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
      <Toolbar>
        <Typography variant="h6" sx={{ fontWeight: 700, flexGrow: 1 }}>
          SupportFlow AI
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {session?.user?.image && (
            <Avatar src={session.user.image} sx={{ width: 32, height: 32 }} />
          )}
          <Typography variant="body2">{session?.user?.name}</Typography>
          <Tooltip title="Se déconnecter">
            <IconButton color="inherit" onClick={() => signOut({ callbackUrl: '/login' })}>
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
