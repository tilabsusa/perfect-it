import { faker } from '@faker-js/faker';

export interface CognitoUser {
  username: string;
  attributes: {
    sub: string;
    email: string;
    email_verified: boolean;
    preferred_username?: string;
    phone_number?: string;
    phone_number_verified?: boolean;
  };
  signInUserSession: {
    idToken: {
      jwtToken: string;
      payload: Record<string, any>;
    };
    accessToken: {
      jwtToken: string;
      payload: Record<string, any>;
    };
    refreshToken: {
      token: string;
    };
  };
}

export interface AuthTokens {
  idToken: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export const createAuthTokens = (overrides?: Partial<AuthTokens>): AuthTokens => {
  return {
    idToken: faker.string.alphanumeric(200),
    accessToken: faker.string.alphanumeric(200),
    refreshToken: faker.string.alphanumeric(100),
    expiresIn: 3600,
    tokenType: 'Bearer',
    ...overrides,
  };
};

export const createCognitoUser = (overrides?: Partial<CognitoUser>): CognitoUser => {
  const username = faker.internet.userName();
  const email = faker.internet.email();
  const sub = faker.string.uuid();

  return {
    username,
    attributes: {
      sub,
      email,
      email_verified: true,
      preferred_username: username,
      ...overrides?.attributes,
    },
    signInUserSession: {
      idToken: {
        jwtToken: faker.string.alphanumeric(200),
        payload: {
          sub,
          'cognito:username': username,
          email,
          email_verified: true,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 3600,
        },
      },
      accessToken: {
        jwtToken: faker.string.alphanumeric(200),
        payload: {
          sub,
          username,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 3600,
        },
      },
      refreshToken: {
        token: faker.string.alphanumeric(100),
      },
      ...overrides?.signInUserSession,
    },
    ...overrides,
  };
};

export const createAuthError = (code: string, message?: string) => {
  const errorMessages: Record<string, string> = {
    UserNotFoundException: 'User does not exist.',
    NotAuthorizedException: 'Incorrect username or password.',
    UserNotConfirmedException: 'User is not confirmed.',
    PasswordResetRequiredException: 'Password reset is required.',
    InvalidParameterException: 'Invalid parameter provided.',
    UsernameExistsException: 'Username already exists.',
    CodeMismatchException: 'Invalid verification code provided.',
    ExpiredCodeException: 'Verification code has expired.',
    TooManyRequestsException: 'Too many requests. Please try again later.',
  };

  return {
    code,
    name: code,
    message: message || errorMessages[code] || 'An error occurred during authentication.',
  };
};

export const createMockSession = (isAuthenticated: boolean = true) => {
  if (!isAuthenticated) {
    return null;
  }

  return {
    user: createCognitoUser(),
    tokens: createAuthTokens(),
    isValid: true,
    expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
  };
};
