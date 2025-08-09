'use client';

import React from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import AmplifyProvider from '@/components/ui/AmplifyProvider';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#667eea',
      light: '#764ba2',
      dark: '#5a67d8',
    },
    secondary: {
      main: '#764ba2',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: 'rgba(0, 0, 0, 0.87)',
        },
      },
    },
  },
});

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AmplifyProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AmplifyProvider>
  );
}
