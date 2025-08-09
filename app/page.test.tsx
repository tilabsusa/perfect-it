import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './page';
import { ThemeProvider, createTheme } from '@mui/material';

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('Landing Page', () => {
  it('renders the hero section with title', () => {
    renderWithTheme(<App />);
    const heading = screen.getByText('Share Your Perfect Moments');
    expect(heading).toBeInTheDocument();
  });

  it('renders the hero description', () => {
    renderWithTheme(<App />);
    const description = screen.getByText(/Discover and showcase perfectly executed ideas/i);
    expect(description).toBeInTheDocument();
  });

  it('renders call-to-action buttons', () => {
    renderWithTheme(<App />);
    const getStartedButton = screen.getByRole('button', { name: /Get Started Free/i });
    const signInButton = screen.getByRole('button', { name: /Sign In/i });

    expect(getStartedButton).toBeInTheDocument();
    expect(signInButton).toBeInTheDocument();
  });

  it('renders feature list', () => {
    renderWithTheme(<App />);
    const features = [
      'Curated collections of perfection',
      'Share your best work with the world',
      'Connect with like-minded creators',
      'Get inspired by excellence',
    ];

    features.forEach((feature) => {
      expect(screen.getByText(feature)).toBeInTheDocument();
    });
  });

  it('renders value proposition sections', () => {
    renderWithTheme(<App />);
    expect(screen.getByText('Discover')).toBeInTheDocument();
    expect(screen.getByText('Share')).toBeInTheDocument();
    expect(screen.getByText('Connect')).toBeInTheDocument();
  });

  it('has proper links for authentication', () => {
    renderWithTheme(<App />);
    const registerLink = screen.getByRole('link', { name: /Get Started Free/i });
    const loginLink = screen.getByRole('link', { name: /Sign In/i });

    expect(registerLink).toHaveAttribute('href', '/register');
    expect(loginLink).toHaveAttribute('href', '/login');
  });

  it('renders responsive grid layout', () => {
    renderWithTheme(<App />);
    const container = screen.getByText('Share Your Perfect Moments').closest('.MuiGrid-item');
    expect(container).toHaveClass('MuiGrid-item');
  });
});
