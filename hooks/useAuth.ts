'use client';

import { useState, useEffect, useCallback } from 'react';
import { getCurrentUser, signOut, fetchAuthSession } from 'aws-amplify/auth';

export interface AuthUser {
  username: string;
  userId: string;
  email?: string;
  isVerified?: boolean;
}

export interface UseAuthReturn {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: Error | null;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const currentUser = await getCurrentUser();
      const session = await fetchAuthSession();

      if (currentUser && session.tokens) {
        setUser({
          username: currentUser.username,
          userId: currentUser.userId,
          email: session.tokens.idToken?.payload?.email as string | undefined,
          isVerified: session.tokens.idToken?.payload?.email_verified as boolean | undefined,
        });
      } else {
        setUser(null);
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'UserUnAuthenticatedException') {
        setError(err);
      }
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      setIsLoading(true);
      await signOut();
      setUser(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to sign out'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    signOut: handleSignOut,
    refreshUser: fetchUser,
  };
};
