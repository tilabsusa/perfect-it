import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Navigation from './Navigation';
import { ThemeProvider, createTheme } from '@mui/material';
import { getCurrentUser, signOut } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';

jest.mock('aws-amplify/auth', () => ({
  getCurrentUser: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock('aws-amplify/utils', () => ({
  Hub: {
    listen: jest.fn(),
  },
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('Navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (Hub.listen as jest.Mock).mockReturnValue(() => {});
  });

  describe('Unauthenticated state', () => {
    beforeEach(() => {
      (getCurrentUser as jest.Mock).mockRejectedValue(new Error('Not authenticated'));
    });

    it('renders the PerfectIt logo', async () => {
      renderWithTheme(<Navigation />);
      await waitFor(() => {
        expect(screen.getByText('PerfectIt')).toBeInTheDocument();
      });
    });

    it('renders navigation items for desktop', async () => {
      renderWithTheme(<Navigation />);
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Home' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Browse' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'About' })).toBeInTheDocument();
      });
    });

    it('renders Sign In and Sign Up buttons when not authenticated', async () => {
      renderWithTheme(<Navigation />);
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument();
      });
    });

    it('does not show user menu when not authenticated', async () => {
      renderWithTheme(<Navigation />);
      await waitFor(() => {
        expect(screen.queryByLabelText('account of current user')).not.toBeInTheDocument();
      });
    });
  });

  describe('Authenticated state', () => {
    const mockUser = {
      username: 'testuser',
      userId: '123',
      signInDetails: { loginId: 'test@example.com' },
    };

    beforeEach(() => {
      (getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
    });

    it('shows user avatar when authenticated', async () => {
      renderWithTheme(<Navigation />);
      await waitFor(() => {
        expect(screen.getByLabelText('account of current user')).toBeInTheDocument();
      });
    });

    it('displays user initial in avatar', async () => {
      renderWithTheme(<Navigation />);
      await waitFor(() => {
        expect(screen.getByText('T')).toBeInTheDocument();
      });
    });

    it('does not show Sign In/Sign Up buttons when authenticated', async () => {
      renderWithTheme(<Navigation />);
      await waitFor(() => {
        expect(screen.queryByRole('button', { name: 'Sign In' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Sign Up' })).not.toBeInTheDocument();
      });
    });

    it('opens user menu on avatar click', async () => {
      renderWithTheme(<Navigation />);
      await waitFor(() => {
        const avatar = screen.getByLabelText('account of current user');
        fireEvent.click(avatar);
      });
      
      expect(screen.getByRole('menuitem', { name: 'Dashboard' })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: 'Sign Out' })).toBeInTheDocument();
    });

    it('calls signOut when Sign Out is clicked', async () => {
      renderWithTheme(<Navigation />);
      await waitFor(() => {
        const avatar = screen.getByLabelText('account of current user');
        fireEvent.click(avatar);
      });
      
      const signOutButton = screen.getByRole('menuitem', { name: 'Sign Out' });
      fireEvent.click(signOutButton);
      
      expect(signOut).toHaveBeenCalled();
    });
  });

  describe('Mobile navigation', () => {
    it('calls onMenuClick when hamburger menu is clicked', async () => {
      const mockOnMenuClick = jest.fn();
      
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      });
      
      renderWithTheme(<Navigation onMenuClick={mockOnMenuClick} />);
      
      await waitFor(() => {
        const menuButton = screen.getByLabelText('menu');
        fireEvent.click(menuButton);
        expect(mockOnMenuClick).toHaveBeenCalled();
      });
    });
  });

  describe('Hub event handling', () => {
    it('listens for auth events', () => {
      renderWithTheme(<Navigation />);
      expect(Hub.listen).toHaveBeenCalledWith('auth', expect.any(Function));
    });

    it('updates user state on signedIn event', async () => {
      const mockUser = { username: 'newuser' };
      (getCurrentUser as jest.Mock).mockRejectedValueOnce(new Error('Not authenticated'))
        .mockResolvedValueOnce(mockUser);
      
      let authCallback: any;
      (Hub.listen as jest.Mock).mockImplementation((channel, callback) => {
        authCallback = callback;
        return () => {};
      });
      
      renderWithTheme(<Navigation />);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
      });
      
      authCallback({ payload: { event: 'signedIn' } });
      
      await waitFor(() => {
        expect(getCurrentUser).toHaveBeenCalledTimes(2);
      });
    });
  });
});