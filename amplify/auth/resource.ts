import { defineAuth, secret } from '@aws-amplify/backend';

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
        clientId: secret('GOOGLE_CLIENT_ID'),
        clientSecret: secret('GOOGLE_CLIENT_SECRET'),
        scopes: ['email', 'profile', 'openid'],
        attributeMapping: {
          email: 'email',
          preferredUsername: 'name',
          profilePicture: 'picture',
        },
      },
      facebook: {
        clientId: secret('FACEBOOK_APP_ID'),
        clientSecret: secret('FACEBOOK_APP_SECRET'),
        scopes: ['email', 'public_profile'],
        attributeMapping: {
          email: 'email',
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
  groups: ['STANDARD_USER', 'MODERATOR', 'ADMIN'],
  multifactor: {
    mode: 'OPTIONAL',
    sms: true,
    totp: true,
  },
  triggers: {},
});
