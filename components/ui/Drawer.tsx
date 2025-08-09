'use client';

import React, { useEffect, useState } from 'react';
import {
  SwipeableDrawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Box,
  Typography,
  Button,
  Avatar,
  ListItemAvatar,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ExploreIcon from '@mui/icons-material/Explore';
import InfoIcon from '@mui/icons-material/Info';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCurrentUser, signOut } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';

interface MobileDrawerProps {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export default function MobileDrawer({ open, onOpen, onClose }: MobileDrawerProps) {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

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

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
      onClose();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleNavigation = (href: string) => {
    router.push(href);
    onClose();
  };

  const navItems = [
    { label: 'Home', href: '/', icon: <HomeIcon /> },
    { label: 'Browse', href: '/browse', icon: <ExploreIcon /> },
    { label: 'About', href: '/about', icon: <InfoIcon /> },
  ];

  return (
    <SwipeableDrawer
      anchor="left"
      open={open}
      onClose={onClose}
      onOpen={onOpen}
      sx={{
        '& .MuiDrawer-paper': {
          width: 280,
        },
      }}
    >
      <Box sx={{ width: 280, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ p: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: 'white',
            }}
          >
            PerfectIt
          </Typography>
        </Box>

        {user && (
          <>
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                {user.username?.charAt(0).toUpperCase() || <AccountCircleIcon />}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  {user.username || 'User'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user.signInDetails?.loginId || ''}
                </Typography>
              </Box>
            </Box>
            <Divider />
          </>
        )}

        <List sx={{ flexGrow: 1 }}>
          {navItems.map((item) => (
            <ListItem key={item.label} disablePadding>
              <ListItemButton onClick={() => handleNavigation(item.href)}>
                <ListItemAvatar sx={{ minWidth: 40 }}>
                  {item.icon}
                </ListItemAvatar>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}

          {user && (
            <>
              <Divider sx={{ my: 1 }} />
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleNavigation('/dashboard')}>
                  <ListItemAvatar sx={{ minWidth: 40 }}>
                    <DashboardIcon />
                  </ListItemAvatar>
                  <ListItemText primary="Dashboard" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton onClick={handleSignOut}>
                  <ListItemAvatar sx={{ minWidth: 40 }}>
                    <LogoutIcon />
                  </ListItemAvatar>
                  <ListItemText primary="Sign Out" />
                </ListItemButton>
              </ListItem>
            </>
          )}
        </List>

        {!user && (
          <Box sx={{ p: 2 }}>
            <Link href="/register" passHref style={{ textDecoration: 'none' }}>
              <Button
                fullWidth
                variant="contained"
                sx={{
                  mb: 1,
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a67d8 0%, #6b4299 100%)',
                  },
                }}
                onClick={onClose}
              >
                Sign Up
              </Button>
            </Link>
            <Link href="/login" passHref style={{ textDecoration: 'none' }}>
              <Button
                fullWidth
                variant="outlined"
                sx={{
                  textTransform: 'none',
                }}
                onClick={onClose}
              >
                Sign In
              </Button>
            </Link>
          </Box>
        )}
      </Box>
    </SwipeableDrawer>
  );
}