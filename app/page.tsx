'use client';

import { Box, Button, Container, Grid, Typography, Stack } from '@mui/material';
import Link from 'next/link';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

export default function App() {
  return (
    <Box>
      <Container maxWidth="lg">
        <Grid
          container
          spacing={4}
          alignItems="center"
          justifyContent="center"
          sx={{ minHeight: '90vh', py: 8 }}
        >
          <Grid item xs={12} md={6}>
            <Stack spacing={4}>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  lineHeight: 1.2,
                }}
              >
                Share Your Perfect Moments
              </Typography>

              <Typography
                variant="h5"
                color="text.secondary"
                sx={{ fontSize: { xs: '1.1rem', sm: '1.3rem' } }}
              >
                Discover and showcase perfectly executed ideas, designs, and solutions. Join a
                community that celebrates excellence in every detail.
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Link href="/register" passHref style={{ textDecoration: 'none' }}>
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      textTransform: 'none',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a67d8 0%, #6b4299 100%)',
                      },
                      width: { xs: '100%', sm: 'auto' },
                    }}
                  >
                    Get Started Free
                  </Button>
                </Link>

                <Link href="/login" passHref style={{ textDecoration: 'none' }}>
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      textTransform: 'none',
                      borderWidth: 2,
                      borderColor: 'primary.main',
                      '&:hover': {
                        borderWidth: 2,
                        borderColor: 'primary.dark',
                        backgroundColor: 'primary.50',
                      },
                      width: { xs: '100%', sm: 'auto' },
                    }}
                  >
                    Sign In
                  </Button>
                </Link>
              </Stack>

              <Stack spacing={2} sx={{ mt: 2 }}>
                {[
                  'Curated collections of perfection',
                  'Share your best work with the world',
                  'Connect with like-minded creators',
                  'Get inspired by excellence',
                ].map((feature, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircleOutlineIcon color="primary" />
                    <Typography variant="body1" color="text.secondary">
                      {feature}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box
              sx={{
                width: '100%',
                height: { xs: 300, md: 500 },
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
              }}
            >
              <Typography
                variant="h3"
                sx={{
                  color: 'white',
                  opacity: 0.9,
                  fontSize: { xs: '1.5rem', md: '2rem' },
                }}
              >
                Perfect Showcase
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Grid container spacing={4} sx={{ py: 8, textAlign: 'center' }}>
          <Grid item xs={12} md={4}>
            <Stack spacing={2} alignItems="center">
              <Typography variant="h4" fontWeight={600}>
                Discover
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Browse through curated collections of perfectly executed work across various
                categories
              </Typography>
            </Stack>
          </Grid>

          <Grid item xs={12} md={4}>
            <Stack spacing={2} alignItems="center">
              <Typography variant="h4" fontWeight={600}>
                Share
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Upload and showcase your best work to an audience that appreciates perfection
              </Typography>
            </Stack>
          </Grid>

          <Grid item xs={12} md={4}>
            <Stack spacing={2} alignItems="center">
              <Typography variant="h4" fontWeight={600}>
                Connect
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Join a community of creators who strive for excellence in everything they do
              </Typography>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
