import { defineAuth } from '@aws-amplify/backend';
import { postConfirmation } from '../functions/post-confirmation/resource';

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: {
      verificationEmailStyle: 'CODE',
      verificationEmailSubject: 'Welcome to PerfectIt! Please verify your email',
      verificationEmailBody: (createCode) =>
        `Thanks for signing up! Your verification code is ${createCode()}`,
    },
    externalProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        scopes: ['email', 'profile', 'openid'],
        attributeMapping: {
          email: 'email',
          username: 'sub',
          preferredUsername: 'name',
          profilePicture: 'picture',
        },
      },
      facebook: {
        clientId: process.env.FACEBOOK_APP_ID || '',
        clientSecret: process.env.FACEBOOK_APP_SECRET || '',
        scopes: ['email', 'public_profile'],
        attributeMapping: {
          email: 'email',
          username: 'id',
          preferredUsername: 'name',
        },
      },
      callbackUrls: ['http://localhost:3000/auth/callback', 'https://perfectit.com/auth/callback'],
      logoutUrls: ['http://localhost:3000/', 'https://perfectit.com/'],
    },
  },
  userAttributes: {
    email: {
      required: true,
      mutable: true,
    },
    preferredUsername: {
      required: false,
      mutable: true,
    },
  },
  accountRecovery: 'EMAIL_ONLY',
  passwordPolicy: {
    minLength: 8,
    requireLowercase: true,
    requireUppercase: true,
    requireNumbers: true,
    requireSymbols: true,
  },
  groups: {
    standard_user: {
      precedence: 3,
    },
    moderator: {
      precedence: 2,
    },
    admin: {
      precedence: 1,
    },
  },
  multifactor: {
    mode: 'OPTIONAL',
    sms: true,
    totp: true,
  },
  triggers: {
    postConfirmation,
  },
});
