'use client';

import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link as MuiLink,
  IconButton,
  Stack,
  Divider,
} from '@mui/material';
import TwitterIcon from '@mui/icons-material/Twitter';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: 'Features', href: '/features' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Browse', href: '/browse' },
      { label: 'Collections', href: '/collections' },
    ],
    company: [
      { label: 'About', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact', href: '/contact' },
    ],
    legal: [
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Cookie Policy', href: '/cookies' },
      { label: 'License', href: '/license' },
    ],
    support: [
      { label: 'Help Center', href: '/help' },
      { label: 'FAQs', href: '/faqs' },
      { label: 'Guidelines', href: '/guidelines' },
      { label: 'API', href: '/api' },
    ],
  };

  const socialIcons = [
    { icon: <TwitterIcon />, href: 'https://twitter.com', label: 'Twitter' },
    { icon: <FacebookIcon />, href: 'https://facebook.com', label: 'Facebook' },
    { icon: <InstagramIcon />, href: 'https://instagram.com', label: 'Instagram' },
    { icon: <LinkedInIcon />, href: 'https://linkedin.com', label: 'LinkedIn' },
  ];

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        pt: 6,
        pb: 3,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Stack spacing={2}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                PerfectIt
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Share and discover perfectly executed ideas, designs, and solutions. 
                Join our community of creators who strive for excellence.
              </Typography>
              <Stack direction="row" spacing={1}>
                {socialIcons.map((social) => (
                  <IconButton
                    key={social.label}
                    size="small"
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    sx={{
                      color: 'text.secondary',
                      '&:hover': {
                        color: 'primary.main',
                      },
                    }}
                  >
                    {social.icon}
                  </IconButton>
                ))}
              </Stack>
            </Stack>
          </Grid>

          <Grid item xs={6} sm={3} md={2}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Product
            </Typography>
            <Stack spacing={1}>
              {footerLinks.product.map((link) => (
                <Link key={link.label} href={link.href} passHref style={{ textDecoration: 'none' }}>
                  <MuiLink
                    color="text.secondary"
                    sx={{
                      fontSize: '0.875rem',
                      '&:hover': {
                        color: 'primary.main',
                        textDecoration: 'none',
                      },
                    }}
                  >
                    {link.label}
                  </MuiLink>
                </Link>
              ))}
            </Stack>
          </Grid>

          <Grid item xs={6} sm={3} md={2}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Company
            </Typography>
            <Stack spacing={1}>
              {footerLinks.company.map((link) => (
                <Link key={link.label} href={link.href} passHref style={{ textDecoration: 'none' }}>
                  <MuiLink
                    color="text.secondary"
                    sx={{
                      fontSize: '0.875rem',
                      '&:hover': {
                        color: 'primary.main',
                        textDecoration: 'none',
                      },
                    }}
                  >
                    {link.label}
                  </MuiLink>
                </Link>
              ))}
            </Stack>
          </Grid>

          <Grid item xs={6} sm={3} md={2}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Legal
            </Typography>
            <Stack spacing={1}>
              {footerLinks.legal.map((link) => (
                <Link key={link.label} href={link.href} passHref style={{ textDecoration: 'none' }}>
                  <MuiLink
                    color="text.secondary"
                    sx={{
                      fontSize: '0.875rem',
                      '&:hover': {
                        color: 'primary.main',
                        textDecoration: 'none',
                      },
                    }}
                  >
                    {link.label}
                  </MuiLink>
                </Link>
              ))}
            </Stack>
          </Grid>

          <Grid item xs={6} sm={3} md={2}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Support
            </Typography>
            <Stack spacing={1}>
              {footerLinks.support.map((link) => (
                <Link key={link.label} href={link.href} passHref style={{ textDecoration: 'none' }}>
                  <MuiLink
                    color="text.secondary"
                    sx={{
                      fontSize: '0.875rem',
                      '&:hover': {
                        color: 'primary.main',
                        textDecoration: 'none',
                      },
                    }}
                  >
                    {link.label}
                  </MuiLink>
                </Link>
              ))}
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary" align="center">
            © {currentYear} PerfectIt. All rights reserved.
          </Typography>
          <Stack direction="row" spacing={2}>
            <Link href="/terms" passHref style={{ textDecoration: 'none' }}>
              <MuiLink
                color="text.secondary"
                sx={{
                  fontSize: '0.875rem',
                  '&:hover': {
                    color: 'primary.main',
                    textDecoration: 'none',
                  },
                }}
              >
                Terms
              </MuiLink>
            </Link>
            <Link href="/privacy" passHref style={{ textDecoration: 'none' }}>
              <MuiLink
                color="text.secondary"
                sx={{
                  fontSize: '0.875rem',
                  '&:hover': {
                    color: 'primary.main',
                    textDecoration: 'none',
                  },
                }}
              >
                Privacy
              </MuiLink>
            </Link>
            <Link href="/cookies" passHref style={{ textDecoration: 'none' }}>
              <MuiLink
                color="text.secondary"
                sx={{
                  fontSize: '0.875rem',
                  '&:hover': {
                    color: 'primary.main',
                    textDecoration: 'none',
                  },
                }}
              >
                Cookies
              </MuiLink>
            </Link>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}