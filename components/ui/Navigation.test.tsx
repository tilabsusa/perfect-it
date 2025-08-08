/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Navigation } from './Navigation';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Mock Next.js Link component with forwardRef
jest.mock('next/link', () => {
  const React = require('react');
  // eslint-disable-next-line react/display-name
  return React.forwardRef(
    (
      { children, href }: { children: React.ReactNode; href: string },
      ref: React.Ref<HTMLAnchorElement>
    ) => {
      return (
        <a href={href} ref={ref}>
          {children}
        </a>
      );
    }
  );
});

// Helper function to render component with MUI theme
const renderWithTheme = (ui: React.ReactElement) => {
  const theme = createTheme();
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe('Navigation Component', () => {
  // Test basic rendering
  it('renders the navigation bar with app title', () => {
    renderWithTheme(<Navigation />);

    expect(screen.getByText('PerfectIt')).toBeInTheDocument();
    expect(screen.getByText('Browse Cards')).toBeInTheDocument();
  });

  // Test unauthenticated state
  describe('when user is not authenticated', () => {
    it('shows login and sign up buttons', () => {
      renderWithTheme(<Navigation isAuthenticated={false} />);

      expect(screen.getByText('Login')).toBeInTheDocument();
      expect(screen.getByText('Sign Up')).toBeInTheDocument();
      expect(screen.queryByText('Logout')).not.toBeInTheDocument();
      expect(screen.queryByText('Create Card')).not.toBeInTheDocument();
    });

    it('has correct links for unauthenticated users', () => {
      renderWithTheme(<Navigation isAuthenticated={false} />);

      const loginLink = screen.getByText('Login').closest('a');
      const signUpLink = screen.getByText('Sign Up').closest('a');

      expect(loginLink).toHaveAttribute('href', '/login');
      expect(signUpLink).toHaveAttribute('href', '/register');
    });
  });

  // Test authenticated state
  describe('when user is authenticated', () => {
    const mockLogout = jest.fn();

    beforeEach(() => {
      mockLogout.mockClear();
    });

    it('shows authenticated user navigation items', () => {
      renderWithTheme(
        <Navigation isAuthenticated={true} username="testuser" onLogout={mockLogout} />
      );

      expect(screen.getByText('Create Card')).toBeInTheDocument();
      expect(screen.getByText('testuser')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
      expect(screen.queryByText('Login')).not.toBeInTheDocument();
      expect(screen.queryByText('Sign Up')).not.toBeInTheDocument();
    });

    it('displays default profile text when username is not provided', () => {
      renderWithTheme(<Navigation isAuthenticated={true} onLogout={mockLogout} />);

      expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    it('calls onLogout when logout button is clicked', () => {
      renderWithTheme(
        <Navigation isAuthenticated={true} username="testuser" onLogout={mockLogout} />
      );

      const logoutButton = screen.getByText('Logout');
      fireEvent.click(logoutButton);

      expect(mockLogout).toHaveBeenCalledTimes(1);
    });

    it('has correct links for authenticated users', () => {
      renderWithTheme(
        <Navigation isAuthenticated={true} username="testuser" onLogout={mockLogout} />
      );

      const createCardLink = screen.getByText('Create Card').closest('a');
      const profileLink = screen.getByText('testuser').closest('a');

      expect(createCardLink).toHaveAttribute('href', '/cards/create');
      expect(profileLink).toHaveAttribute('href', '/profile');
    });
  });

  // Test common navigation items
  describe('common navigation items', () => {
    it('always shows browse cards link', () => {
      const { rerender } = renderWithTheme(<Navigation isAuthenticated={false} />);
      expect(screen.getByText('Browse Cards')).toBeInTheDocument();

      rerender(
        <ThemeProvider theme={createTheme()}>
          <Navigation isAuthenticated={true} />
        </ThemeProvider>
      );
      expect(screen.getByText('Browse Cards')).toBeInTheDocument();
    });

    it('home link navigates to root', () => {
      renderWithTheme(<Navigation />);

      const homeLink = screen.getByText('PerfectIt').closest('a');
      expect(homeLink).toHaveAttribute('href', '/');
    });
  });
});
