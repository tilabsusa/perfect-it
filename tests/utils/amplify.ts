import { Amplify } from 'aws-amplify';

/**
 * Mock Amplify configuration for testing
 */
export const mockAmplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: 'us-east-1_TEST',
      userPoolClientId: 'TEST_CLIENT_ID',
      identityPoolId: 'us-east-1:TEST-IDENTITY-POOL',
      region: 'us-east-1',
      loginWith: {
        oauth: {
          domain: 'test.auth.us-east-1.amazoncognito.com',
          scopes: ['email', 'profile', 'openid'],
          redirectSignIn: ['http://localhost:3000/'],
          redirectSignOut: ['http://localhost:3000/'],
          responseType: 'code',
        },
      },
    },
  },
  API: {
    GraphQL: {
      endpoint: 'http://localhost:20002/graphql',
      region: 'us-east-1',
      defaultAuthMode: 'userPool',
    },
  },
  Storage: {
    S3: {
      bucket: 'test-bucket',
      region: 'us-east-1',
    },
  },
};

/**
 * Configure Amplify for testing environment
 */
export const configureAmplifyForTesting = () => {
  Amplify.configure(mockAmplifyConfig, { ssr: true });
};

/**
 * Mock authenticated user context
 */
export const mockAuthenticatedContext = () => {
  return {
    tokens: {
      idToken: {
        payload: {
          sub: 'test-user-id',
          email: 'test@example.com',
          email_verified: true,
          'cognito:username': 'testuser',
        },
      },
      accessToken: {
        payload: {
          sub: 'test-user-id',
          username: 'testuser',
        },
      },
    },
    credentials: {
      accessKeyId: 'TEST_ACCESS_KEY',
      secretAccessKey: 'TEST_SECRET_KEY',
      sessionToken: 'TEST_SESSION_TOKEN',
    },
    userSub: 'test-user-id',
  };
};

/**
 * Mock GraphQL operation result
 */
export const mockGraphQLResult = <T>(data: T, errors?: any[]) => {
  return {
    data,
    errors: errors || undefined,
    extensions: {},
  };
};

/**
 * Mock GraphQL error
 */
export const mockGraphQLError = (message: string, errorType?: string) => {
  return {
    data: null,
    errors: [
      {
        message,
        errorType: errorType || 'GraphQLError',
        path: [],
        locations: [],
      },
    ],
  };
};

/**
 * Mock S3 upload result
 */
export const mockS3UploadResult = (key: string) => {
  return {
    key,
    url: `https://test-bucket.s3.amazonaws.com/${key}`,
    fields: {},
  };
};

/**
 * Reset all Amplify mocks
 */
export const resetAmplifyMocks = () => {
  jest.clearAllMocks();
};
