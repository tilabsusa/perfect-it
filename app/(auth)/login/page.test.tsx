/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import LoginPage from './page';
import { signIn } from 'aws-amplify/auth';
import { useRouter } from 'next/navigation';

// Mock AWS Amplify auth
jest.mock('aws-amplify/auth', () => ({
  signIn: jest.fn(),
}));

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

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

describe('LoginPage', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  // Test basic rendering
  it('renders login form with all required fields', () => {
    renderWithTheme(<LoginPage />);

    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText(/don't have an account\? sign up/i)).toBeInTheDocument();
  });

  // Test form validation
  describe('form validation', () => {
    it('does not submit with empty fields', async () => {
      renderWithTheme(<LoginPage />);

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      const form = submitButton.closest('form');

      // Try to submit form programmatically
      if (form) {
        fireEvent.submit(form);
      }

      // Form should not actually submit due to HTML5 validation
      // Check that we're still on the login form
      expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    });

    it('validates email format', async () => {
      renderWithTheme(<LoginPage />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);

      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      const form = emailInput.closest('form');
      if (form) {
        fireEvent.submit(form);
      }

      await waitFor(
        () => {
          expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('clears error when user corrects input', async () => {
      renderWithTheme(<LoginPage />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);

      // Submit with invalid email
      fireEvent.change(emailInput, { target: { value: 'invalid' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      const form = emailInput.closest('form');
      if (form) {
        fireEvent.submit(form);
      }

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
      });

      // Fix the email
      fireEvent.change(emailInput, { target: { value: 'valid@email.com' } });

      // Error should be cleared
      expect(screen.queryByText('Please enter a valid email address')).not.toBeInTheDocument();
    });
  });

  // Test successful login
  describe('successful login', () => {
    it('calls signIn with correct credentials and redirects', async () => {
      (signIn as jest.Mock).mockResolvedValue({ isSignedIn: true });

      renderWithTheme(<LoginPage />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);

      fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Password123!' } });

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(signIn).toHaveBeenCalledWith({
          username: 'user@example.com',
          password: 'Password123!',
        });
        expect(mockPush).toHaveBeenCalledWith('/cards');
      });
    });

    it('shows loading state during sign in', async () => {
      (signIn as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ isSignedIn: true }), 100))
      );

      renderWithTheme(<LoginPage />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);

      fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Password123!' } });

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      // Check loading state
      expect(screen.getByRole('button', { name: /signing in/i })).toBeInTheDocument();
      expect(emailInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      });
    });
  });

  // Test error handling
  describe('error handling', () => {
    it('shows error for user not found', async () => {
      const error = new Error('User not found');
      error.name = 'UserNotFoundException';
      (signIn as jest.Mock).mockRejectedValue(error);

      renderWithTheme(<LoginPage />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);

      fireEvent.change(emailInput, { target: { value: 'nonexistent@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Password123!' } });

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('No account found with this email address.')).toBeInTheDocument();
      });
    });

    it('shows error for incorrect password', async () => {
      const error = new Error('Incorrect password');
      error.name = 'NotAuthorizedException';
      (signIn as jest.Mock).mockRejectedValue(error);

      renderWithTheme(<LoginPage />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);

      fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'WrongPassword!' } });

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid email or password.')).toBeInTheDocument();
      });
    });

    it('shows error for unconfirmed user', async () => {
      const error = new Error('User not confirmed');
      error.name = 'UserNotConfirmedException';
      (signIn as jest.Mock).mockRejectedValue(error);

      renderWithTheme(<LoginPage />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);

      fireEvent.change(emailInput, { target: { value: 'unconfirmed@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Password123!' } });

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Please verify your email address before signing in.')
        ).toBeInTheDocument();
      });
    });

    it('shows generic error for unknown errors', async () => {
      const error = new Error('Network error');
      (signIn as jest.Mock).mockRejectedValue(error);

      renderWithTheme(<LoginPage />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);

      fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Password123!' } });

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('An error occurred during sign in. Please try again.')
        ).toBeInTheDocument();
      });
    });
  });

  // Test navigation
  describe('navigation', () => {
    it('has link to registration page', () => {
      renderWithTheme(<LoginPage />);

      const signUpLink = screen.getByText(/don't have an account\? sign up/i).closest('a');
      expect(signUpLink).toHaveAttribute('href', '/register');
    });
  });
});
