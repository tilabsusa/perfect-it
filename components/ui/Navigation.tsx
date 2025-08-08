'use client';

import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import Link from 'next/link';

interface NavigationProps {
  isAuthenticated?: boolean;
  username?: string;
  onLogout?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  isAuthenticated = false,
  username,
  onLogout,
}) => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>
            PerfectIt
          </Link>
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button color="inherit" component={Link} href="/cards">
            Browse Cards
          </Button>

          {isAuthenticated ? (
            <>
              <Button color="inherit" component={Link} href="/cards/create">
                Create Card
              </Button>
              <Button color="inherit" component={Link} href="/profile">
                {username || 'Profile'}
              </Button>
              <Button color="inherit" onClick={onLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} href="/login">
                Login
              </Button>
              <Button color="inherit" component={Link} href="/register">
                Sign Up
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};
