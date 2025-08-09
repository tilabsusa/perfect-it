'use client';

import React, { useState, useEffect } from 'react';
import { Box, Toolbar } from '@mui/material';
import dynamic from 'next/dynamic';
import Providers from './providers';
import { getCurrentUser } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';

// Dynamic imports to prevent SSR issues
const Navigation = dynamic(() => import('@/components/ui/Navigation'), {
  ssr: false,
});
const MobileDrawer = dynamic(() => import('@/components/ui/Drawer'), {
  ssr: false,
});
const PermanentDrawer = dynamic(() => import('@/components/ui/PermanentDrawer'), {
  ssr: false,
});
const Footer = dynamic(() => import('@/components/ui/Footer'), {
  ssr: false,
});

const drawerWidth = 240;

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthState();

    // Listen for auth events
    const hubListener = Hub.listen('auth', (data) => {
      switch (data.payload.event) {
        case 'signedIn':
          setIsAuthenticated(true);
          break;
        case 'signedOut':
          setIsAuthenticated(false);
          break;
      }
    });

    return () => hubListener();
  }, []);

  const checkAuthState = async () => {
    try {
      await getCurrentUser();
      setIsAuthenticated(true);
    } catch {
      setIsAuthenticated(false);
    }
  };

  const handleMobileDrawerOpen = () => {
    setMobileDrawerOpen(true);
  };

  const handleMobileDrawerClose = () => {
    setMobileDrawerOpen(false);
  };

  return (
    <Providers>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        {/* Top Navigation Bar - Always visible */}
        <Navigation onMenuClick={handleMobileDrawerOpen} />

        {/* Permanent Drawer for Desktop - Only when authenticated */}
        {isAuthenticated && <PermanentDrawer />}

        {/* Mobile Drawer - Only when authenticated */}
        {isAuthenticated && (
          <MobileDrawer
            open={mobileDrawerOpen}
            onOpen={handleMobileDrawerOpen}
            onClose={handleMobileDrawerClose}
          />
        )}

        {/* Main Content Area */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            width: isAuthenticated ? { xs: '100%', md: `calc(100% - ${drawerWidth}px)` } : '100%',
            ml: isAuthenticated ? { xs: 0, md: `${drawerWidth}px` } : 0,
            backgroundColor: 'background.default',
          }}
        >
          <Toolbar />
          <Box sx={{ flexGrow: 1, p: { xs: 2, sm: 3 } }}>{children}</Box>
          <Footer />
        </Box>
      </Box>
    </Providers>
  );
}
