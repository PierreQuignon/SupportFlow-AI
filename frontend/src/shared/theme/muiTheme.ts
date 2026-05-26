'use client';

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary:   { main: '#6C3BF5' },
    secondary: { main: '#FF6B35' },
    background: {
      default: '#F8FAFC',
      paper:   '#FFFFFF',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});

export default theme;
