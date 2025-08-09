'use client';

import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Container,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useRouter } from 'next/navigation';
import { getCurrentUser, signOut } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';

interface NavigationProps {
  onMenuClick?: () => void;
}

interface User {
  username?: string;
  userId?: string;
  signInDetails?: {
    loginId?: string;
  };
}

export default function Navigation({ onMenuClick }: NavigationProps) {
  const [user, setUser] = useState<User | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    checkUser();

    const hubListener = Hub.listen('auth', (data) => {
      switch (data.payload.event) {
        case 'signedIn':
          checkUser();
          break;
        case 'signedOut':
          setUser(null);
          break;
      }
    });

    return () => hubListener();
  }, []);

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch {
      setUser(null);
    }
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
      handleUserMenuClose();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleProfileClick = () => {
    router.push('/dashboard');
    handleUserMenuClose();
  };

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Browse', href: '/browse' },
    { label: 'About', href: '/about' },
  ];

  return (
    <AppBar 
      position="fixed" 
      elevation={1}
      sx={{ 
        backgroundColor: '#ffffff',
        color: 'rgba(0, 0, 0, 0.87)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        width: user ? { md: `calc(100% - 240px)` } : '100%',
        ml: user ? { md: `240px` } : 0,
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          {isMobile && user && (
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={onMenuClick}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography
            variant="h6"
            noWrap
            onClick={() => router.push('/')}
            sx={{
              mr: 4,
              fontWeight: 700,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              cursor: 'pointer',
            }}
          >
            PerfectIt
          </Typography>

          {!isMobile && (
            <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
              {navItems.map((item) => (
                <Button
                  key={item.label}
                  onClick={() => router.push(item.href)}
                  sx={{
                    color: 'rgba(0, 0, 0, 0.87)',
                    textTransform: 'none',
                    fontSize: '1rem',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          <Box sx={{ flexGrow: isMobile ? 1 : 0 }} />

          {user ? (
            <>
              <IconButton
                size="large"
                edge="end"
                aria-label="account of current user"
                aria-controls="user-menu"
                aria-haspopup="true"
                onClick={handleUserMenuOpen}
                color="inherit"
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                  {user.username?.charAt(0).toUpperCase() || <AccountCircleIcon />}
                </Avatar>
              </IconButton>
              <Menu
                id="user-menu"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleUserMenuClose}
              >
                <MenuItem onClick={handleProfileClick}>Dashboard</MenuItem>
                <MenuItem onClick={handleSignOut}>Sign Out</MenuItem>
              </Menu>
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="text"
                onClick={() => router.push('/login')}
                sx={{
                  textTransform: 'none',
                  color: 'rgba(0, 0, 0, 0.87)',
                }}
              >
                Sign In
              </Button>
              <Button
                variant="contained"
                onClick={() => router.push('/register')}
                sx={{
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a67d8 0%, #6b4299 100%)',
                  },
                }}
              >
                Sign Up
              </Button>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}