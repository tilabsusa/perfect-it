import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from './useAuth';
import { getCurrentUser, signOut, fetchAuthSession } from 'aws-amplify/auth';

// Mock AWS Amplify auth functions
jest.mock('aws-amplify/auth', () => ({
  getCurrentUser: jest.fn(),
  signOut: jest.fn(),
  fetchAuthSession: jest.fn(),
}));

describe('useAuth Hook', () => {
  // Clear mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test initial loading state
  it('starts with loading state', () => {
    (getCurrentUser as jest.Mock).mockImplementation(() => new Promise(() => {}));
    (fetchAuthSession as jest.Mock).mockImplementation(() => new Promise(() => {}));

    const { result } = renderHook(() => useAuth());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.user).toBe(null);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBe(null);
  });

  // Test authenticated user state
  describe('when user is authenticated', () => {
    const mockUser = {
      username: 'testuser',
      userId: 'user-123',
    };

    const mockSession = {
      tokens: {
        idToken: {
          payload: {
            email: 'test@example.com',
            email_verified: true,
          },
        },
      },
    };

    beforeEach(() => {
      (getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
      (fetchAuthSession as jest.Mock).mockResolvedValue(mockSession);
    });

    it('loads authenticated user data', async () => {
      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toEqual({
        username: 'testuser',
        userId: 'user-123',
        email: 'test@example.com',
        isVerified: true,
      });
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.error).toBe(null);
    });

    it('handles sign out successfully', async () => {
      (signOut as jest.Mock).mockResolvedValue({});

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.signOut();
      });

      expect(signOut).toHaveBeenCalledTimes(1);
      expect(result.current.user).toBe(null);
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('refreshes user data', async () => {
      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Clear previous calls
      (getCurrentUser as jest.Mock).mockClear();
      (fetchAuthSession as jest.Mock).mockClear();

      await act(async () => {
        await result.current.refreshUser();
      });

      expect(getCurrentUser).toHaveBeenCalledTimes(1);
      expect(fetchAuthSession).toHaveBeenCalledTimes(1);
      expect(result.current.user).toBeTruthy();
    });
  });

  // Test unauthenticated user state
  describe('when user is not authenticated', () => {
    beforeEach(() => {
      const error = new Error('UserUnAuthenticatedException');
      error.name = 'UserUnAuthenticatedException';
      (getCurrentUser as jest.Mock).mockRejectedValue(error);
    });

    it('handles unauthenticated state gracefully', async () => {
      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toBe(null);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).toBe(null); // UserUnAuthenticatedException should not be treated as error
    });
  });

  // Test error handling
  describe('error handling', () => {
    it('handles auth errors', async () => {
      const mockError = new Error('Network error');
      (getCurrentUser as jest.Mock).mockRejectedValue(mockError);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toBe(null);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).toEqual(mockError);
    });

    it('handles sign out errors', async () => {
      const mockError = new Error('Sign out failed');
      (getCurrentUser as jest.Mock).mockResolvedValue({ username: 'test', userId: '123' });
      (fetchAuthSession as jest.Mock).mockResolvedValue({
        tokens: {
          idToken: { payload: { email: 'test@example.com' } },
          accessToken: { payload: {} },
        },
      });
      (signOut as jest.Mock).mockRejectedValue(mockError);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.user).not.toBeNull();
      });

      // The signOut should throw an error
      await expect(
        act(async () => {
          await result.current.signOut();
        })
      ).rejects.toThrow('Sign out failed');
    });
  });

  // Test edge cases
  describe('edge cases', () => {
    it('handles missing session tokens', async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue({ username: 'test', userId: '123' });
      (fetchAuthSession as jest.Mock).mockResolvedValue({ tokens: null });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toBe(null);
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('handles partial user data', async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue({ username: 'test', userId: '123' });
      (fetchAuthSession as jest.Mock).mockResolvedValue({
        tokens: {
          idToken: {
            payload: {},
          },
        },
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toEqual({
        username: 'test',
        userId: '123',
        email: undefined,
        isVerified: undefined,
      });
    });
  });
});
