import { getCurrentUser, fetchAuthSession, signIn, signOut, signUp } from 'aws-amplify/auth';

/**
 * Mock auth functions for testing
 */
export const mockAuthFunctions = () => {
  jest.mock('aws-amplify/auth', () => ({
    getCurrentUser: jest.fn(),
    fetchAuthSession: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
    signUp: jest.fn(),
    confirmSignUp: jest.fn(),
    resendSignUpCode: jest.fn(),
    resetPassword: jest.fn(),
    confirmResetPassword: jest.fn(),
  }));
};

/**
 * Mock authenticated user
 */
export const mockCurrentUser = (username: string = 'testuser', userId: string = 'test-user-id') => {
  (getCurrentUser as jest.Mock).mockResolvedValue({
    username,
    userId,
    signInDetails: {
      loginId: `${username}@example.com`,
      authFlowType: 'USER_SRP_AUTH',
    },
  });
};

/**
 * Mock auth session
 */
export const mockAuthSession = (isAuthenticated: boolean = true) => {
  if (isAuthenticated) {
    (fetchAuthSession as jest.Mock).mockResolvedValue({
      tokens: {
        idToken: {
          payload: {
            sub: 'test-user-id',
            email: 'test@example.com',
            email_verified: true,
            'cognito:username': 'testuser',
          },
          toString: () => 'mock-id-token',
        },
        accessToken: {
          payload: {
            sub: 'test-user-id',
            username: 'testuser',
          },
          toString: () => 'mock-access-token',
        },
        refreshToken: {
          toString: () => 'mock-refresh-token',
        },
      },
      credentials: {
        accessKeyId: 'TEST_ACCESS_KEY',
        secretAccessKey: 'TEST_SECRET_KEY',
        sessionToken: 'TEST_SESSION_TOKEN',
        expiration: new Date(Date.now() + 3600000),
      },
      userSub: 'test-user-id',
    });
  } else {
    (fetchAuthSession as jest.Mock).mockResolvedValue({
      tokens: undefined,
      credentials: undefined,
      userSub: undefined,
    });
  }
};

/**
 * Mock successful sign in
 */
export const mockSuccessfulSignIn = () => {
  (signIn as jest.Mock).mockResolvedValue({
    isSignedIn: true,
    nextStep: {
      signInStep: 'DONE',
    },
  });
};

/**
 * Mock sign in with MFA
 */
export const mockSignInWithMFA = () => {
  (signIn as jest.Mock).mockResolvedValue({
    isSignedIn: false,
    nextStep: {
      signInStep: 'CONFIRM_SIGN_IN_WITH_SMS_CODE',
      codeDeliveryDetails: {
        deliveryMedium: 'SMS',
        destination: '+1234***7890',
      },
    },
  });
};

/**
 * Mock sign in error
 */
export const mockSignInError = (errorType: string = 'NotAuthorizedException') => {
  const error = new Error('Authentication failed');
  error.name = errorType;
  (signIn as jest.Mock).mockRejectedValue(error);
};

/**
 * Mock successful sign out
 */
export const mockSuccessfulSignOut = () => {
  (signOut as jest.Mock).mockResolvedValue({});
};

/**
 * Mock successful sign up
 */
export const mockSuccessfulSignUp = () => {
  (signUp as jest.Mock).mockResolvedValue({
    isSignUpComplete: false,
    nextStep: {
      signUpStep: 'CONFIRM_SIGN_UP',
      codeDeliveryDetails: {
        deliveryMedium: 'EMAIL',
        destination: 'test@example.com',
      },
    },
    userId: 'test-user-id',
  });
};

/**
 * Mock unauthenticated state
 */
export const mockUnauthenticatedState = () => {
  const error = new Error('User is not authenticated');
  error.name = 'UserUnAuthenticatedException';
  (getCurrentUser as jest.Mock).mockRejectedValue(error);
  (fetchAuthSession as jest.Mock).mockResolvedValue({
    tokens: undefined,
    credentials: undefined,
    userSub: undefined,
  });
};

/**
 * Clear all auth mocks
 */
export const clearAuthMocks = () => {
  jest.clearAllMocks();
};
