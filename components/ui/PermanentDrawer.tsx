'use client';

import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  Toolbar,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ExploreIcon from '@mui/icons-material/Explore';
import CollectionsIcon from '@mui/icons-material/Collections';
import FavoriteIcon from '@mui/icons-material/Favorite';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import InfoIcon from '@mui/icons-material/Info';
import { useRouter } from 'next/navigation';

const drawerWidth = 240;

interface DrawerItem {
  text: string;
  icon: React.ReactNode;
  path: string;
}

export default function PermanentDrawer() {
  const router = useRouter();

  const mainItems: DrawerItem[] = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'Browse', icon: <ExploreIcon />, path: '/browse' },
    { text: 'Collections', icon: <CollectionsIcon />, path: '/collections' },
    { text: 'Favorites', icon: <FavoriteIcon />, path: '/favorites' },
    { text: 'Trending', icon: <TrendingUpIcon />, path: '/trending' },
  ];

  const bottomItems: DrawerItem[] = [
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
    { text: 'Help', icon: <HelpOutlineIcon />, path: '/help' },
    { text: 'About', icon: <InfoIcon />, path: '/about' },
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        display: { xs: 'none', md: 'block' },
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: '1px solid rgba(0, 0, 0, 0.12)',
          backgroundColor: '#fafafa',
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <List>
          {mainItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton onClick={() => handleNavigation(item.path)}>
                <ListItemIcon sx={{ color: 'primary.main' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{
                    fontSize: '0.95rem',
                    fontWeight: 500,
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        
        <Box sx={{ flexGrow: 1 }} />
        
        <Divider />
        
        <List>
          {bottomItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton onClick={() => handleNavigation(item.path)}>
                <ListItemIcon sx={{ color: 'text.secondary' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.95rem',
                    fontWeight: 500,
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Box sx={{ p: 2, borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}>
          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
            © 2025 PerfectIt
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Version 1.0.0
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
}