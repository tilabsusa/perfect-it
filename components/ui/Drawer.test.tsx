import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MobileDrawer from './Drawer';
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

describe('MobileDrawer', () => {
  const mockOnOpen = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (Hub.listen as jest.Mock).mockReturnValue(() => {});
  });

  describe('Drawer behavior', () => {
    it('renders when open is true', () => {
      renderWithTheme(
        <MobileDrawer open={true} onOpen={mockOnOpen} onClose={mockOnClose} />
      );
      
      expect(screen.getByText('PerfectIt')).toBeInTheDocument();
    });

    it('does not render content when open is false', () => {
      const { container } = renderWithTheme(
        <MobileDrawer open={false} onOpen={mockOnOpen} onClose={mockOnClose} />
      );
      
      const drawer = container.querySelector('.MuiDrawer-root');
      expect(drawer).toBeInTheDocument();
    });

    it('renders navigation items', () => {
      renderWithTheme(
        <MobileDrawer open={true} onOpen={mockOnOpen} onClose={mockOnClose} />
      );
      
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Browse')).toBeInTheDocument();
      expect(screen.getByText('About')).toBeInTheDocument();
    });
  });

  describe('Unauthenticated state', () => {
    beforeEach(() => {
      (getCurrentUser as jest.Mock).mockRejectedValue(new Error('Not authenticated'));
    });

    it('shows Sign Up and Sign In buttons when not authenticated', async () => {
      renderWithTheme(
        <MobileDrawer open={true} onOpen={mockOnOpen} onClose={mockOnClose} />
      );
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
      });
    });

    it('does not show user info when not authenticated', async () => {
      renderWithTheme(
        <MobileDrawer open={true} onOpen={mockOnOpen} onClose={mockOnClose} />
      );
      
      await waitFor(() => {
        expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
        expect(screen.queryByText('Sign Out')).not.toBeInTheDocument();
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

    it('shows user info when authenticated', async () => {
      renderWithTheme(
        <MobileDrawer open={true} onOpen={mockOnOpen} onClose={mockOnClose} />
      );
      
      await waitFor(() => {
        expect(screen.getByText('testuser')).toBeInTheDocument();
        expect(screen.getByText('test@example.com')).toBeInTheDocument();
      });
    });

    it('shows Dashboard and Sign Out options when authenticated', async () => {
      renderWithTheme(
        <MobileDrawer open={true} onOpen={mockOnOpen} onClose={mockOnClose} />
      );
      
      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Sign Out')).toBeInTheDocument();
      });
    });

    it('does not show Sign Up/Sign In buttons when authenticated', async () => {
      renderWithTheme(
        <MobileDrawer open={true} onOpen={mockOnOpen} onClose={mockOnClose} />
      );
      
      await waitFor(() => {
        expect(screen.queryByRole('button', { name: 'Sign Up' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Sign In' })).not.toBeInTheDocument();
      });
    });

    it('calls signOut when Sign Out is clicked', async () => {
      renderWithTheme(
        <MobileDrawer open={true} onOpen={mockOnOpen} onClose={mockOnClose} />
      );
      
      await waitFor(() => {
        const signOutButton = screen.getByText('Sign Out');
        fireEvent.click(signOutButton);
      });
      
      expect(signOut).toHaveBeenCalled();
    });
  });

  describe('Navigation behavior', () => {
    it('closes drawer when navigation item is clicked', async () => {
      renderWithTheme(
        <MobileDrawer open={true} onOpen={mockOnOpen} onClose={mockOnClose} />
      );
      
      const homeButton = screen.getByText('Home');
      fireEvent.click(homeButton);
      
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('closes drawer when Sign Up button is clicked', async () => {
      (getCurrentUser as jest.Mock).mockRejectedValue(new Error('Not authenticated'));
      
      renderWithTheme(
        <MobileDrawer open={true} onOpen={mockOnOpen} onClose={mockOnClose} />
      );
      
      await waitFor(() => {
        const signUpButton = screen.getByRole('button', { name: 'Sign Up' });
        fireEvent.click(signUpButton);
      });
      
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Hub event handling', () => {
    it('listens for auth events', () => {
      renderWithTheme(
        <MobileDrawer open={true} onOpen={mockOnOpen} onClose={mockOnClose} />
      );
      
      expect(Hub.listen).toHaveBeenCalledWith('auth', expect.any(Function));
    });

    it('updates user state on signedOut event', async () => {
      const mockUser = { username: 'testuser' };
      (getCurrentUser as jest.Mock).mockResolvedValueOnce(mockUser);
      
      let authCallback: any;
      (Hub.listen as jest.Mock).mockImplementation((channel, callback) => {
        authCallback = callback;
        return () => {};
      });
      
      renderWithTheme(
        <MobileDrawer open={true} onOpen={mockOnOpen} onClose={mockOnClose} />
      );
      
      await waitFor(() => {
        expect(screen.getByText('testuser')).toBeInTheDocument();
      });
      
      authCallback({ payload: { event: 'signedOut' } });
      
      await waitFor(() => {
        expect(screen.queryByText('testuser')).not.toBeInTheDocument();
      });
    });
  });
});