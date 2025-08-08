# Story 1.2 (Enhanced): Implement Authentication Backend with Cognito and OAuth Providers

## Story Statement

As a platform owner,  
I want users to register and authenticate securely with email/password and social providers,  
so that we can protect user data and provide personalized experiences with multiple authentication options.

## Dependencies

- **BLOCKER:** Story 1.0 (User Prerequisites) must be 100% complete
- **REQUIRED:** Story 1.1 (Project initialization) must be complete

## Detailed Implementation Steps

### Part A: Cognito User Pool Configuration

#### Step 1: Define Amplify Auth Resource

**File:** `amplify/auth/resource.ts`

```typescript
import { defineAuth } from '@aws-amplify/backend';

export const auth = defineAuth({
  loginWith: {
    email: true,
    // Social providers will be added after initial setup
  },
  userAttributes: {
    email: {
      required: true,
      mutable: true,
    },
    preferred_username: {
      required: false,
      mutable: true,
    },
    name: {
      required: false,
      mutable: true,
    },
    picture: {
      required: false,
      mutable: true,
    },
  },
  passwordPolicy: {
    minLength: 8,
    requireLowercase: true,
    requireUppercase: true,
    requireNumbers: true,
    requireSymbols: true,
  },
  accountRecovery: 'EMAIL_ONLY',
  userGroups: [
    {
      groupName: 'standard_user',
      description: 'Regular platform users',
    },
    {
      groupName: 'moderator',
      description: 'Content moderators with special permissions',
    },
    {
      groupName: 'admin',
      description: 'Platform administrators with full access',
    },
  ],
});
```

#### Step 2: Configure Lambda Triggers

**File:** `amplify/auth/post-confirmation/handler.ts`

```typescript
import { PostConfirmationTriggerHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { PutCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler: PostConfirmationTriggerHandler = async (event) => {
  // Initialize user profile in DynamoDB after confirmation
  const userProfile = {
    id: event.request.userAttributes.sub,
    email: event.request.userAttributes.email,
    username: event.request.userAttributes.preferred_username || event.request.userAttributes.email,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    reputationScore: 0,
    cardsCreated: 0,
    totalUpvotes: 0,
    isActive: true,
    profileComplete: false,
  };

  try {
    await docClient.send(
      new PutCommand({
        TableName: process.env.USER_PROFILE_TABLE_NAME!,
        Item: userProfile,
      })
    );

    console.log('User profile created successfully:', userProfile.id);
  } catch (error) {
    console.error('Error creating user profile:', error);
    // Don't throw - allow user to be created even if profile fails
  }

  return event;
};
```

### Part B: OAuth Provider Integration

#### Step 3: Configure Google OAuth

**File:** `amplify/auth/oauth/google-config.ts`

```typescript
import { SecretValue } from '@aws-amplify/backend';

export const googleOAuthConfig = {
  clientId: SecretValue.fromName('GOOGLE_CLIENT_ID'),
  clientSecret: SecretValue.fromName('GOOGLE_CLIENT_SECRET'),
  scopes: ['openid', 'email', 'profile'],
  attributeMapping: {
    email: 'email',
    name: 'name',
    picture: 'picture',
    preferred_username: 'email',
    email_verified: 'email_verified',
  },
};
```

**Manual AWS Console Steps Required:**

1. Navigate to Cognito User Pool in AWS Console
2. Go to "Sign-in experience" → "Federated identity provider sign-in"
3. Click "Add identity provider" → "Google"
4. Enter the Google Client ID and Client Secret from Story 1.0
5. Set Authorized scopes: `openid email profile`
6. Map attributes:
   - Google attribute `email` → User pool attribute `email`
   - Google attribute `name` → User pool attribute `name`
   - Google attribute `picture` → User pool attribute `picture`
7. Save configuration

#### Step 4: Configure Facebook OAuth

**File:** `amplify/auth/oauth/facebook-config.ts`

```typescript
import { SecretValue } from '@aws-amplify/backend';

export const facebookOAuthConfig = {
  clientId: SecretValue.fromName('FACEBOOK_APP_ID'),
  clientSecret: SecretValue.fromName('FACEBOOK_APP_SECRET'),
  scopes: ['public_profile', 'email'],
  attributeMapping: {
    email: 'email',
    name: 'name',
    picture: 'picture.data.url',
    preferred_username: 'email',
  },
};
```

**Manual AWS Console Steps Required:**

1. In Cognito User Pool, go to "Sign-in experience"
2. Click "Add identity provider" → "Facebook"
3. Enter the Facebook App ID and App Secret from Story 1.0
4. Set Authorized scopes: `public_profile email`
5. Map attributes:
   - Facebook attribute `email` → User pool attribute `email`
   - Facebook attribute `name` → User pool attribute `name`
6. Save configuration

#### Step 5: Configure App Client Settings

**AWS Console Configuration:**

1. Go to Cognito User Pool → "App integration" → "App clients"
2. Select your app client
3. Configure Hosted UI:
   - Callback URLs:
     ```
     http://localhost:3000/oauth/callback
     https://<amplify-domain>.amplifyapp.com/oauth/callback
     https://your-domain.com/oauth/callback
     ```
   - Sign out URLs:
     ```
     http://localhost:3000/
     https://<amplify-domain>.amplifyapp.com/
     https://your-domain.com/
     ```
   - OAuth 2.0 Grant Types: Authorization code grant
   - OpenID Connect scopes: openid, email, profile
4. Save changes

### Part C: Environment Configuration

#### Step 6: Set Up AWS Secrets Manager

**Script:** `scripts/setup-secrets.sh`

```bash
#!/bin/bash

# This script should be run by the USER after completing Story 1.0

echo "Setting up OAuth secrets in AWS Secrets Manager..."

# Check if AWS CLI is configured
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo "Error: AWS CLI not configured. Please run 'aws configure' first."
    exit 1
fi

# Prompt for values
read -p "Enter Google Client ID: " GOOGLE_CLIENT_ID
read -s -p "Enter Google Client Secret: " GOOGLE_CLIENT_SECRET
echo
read -p "Enter Facebook App ID: " FACEBOOK_APP_ID
read -s -p "Enter Facebook App Secret: " FACEBOOK_APP_SECRET
echo

# Create secrets in AWS Secrets Manager
aws secretsmanager create-secret \
    --name "amplify/auth/GOOGLE_CLIENT_ID" \
    --secret-string "$GOOGLE_CLIENT_ID" \
    --description "Google OAuth Client ID for PerfectIt"

aws secretsmanager create-secret \
    --name "amplify/auth/GOOGLE_CLIENT_SECRET" \
    --secret-string "$GOOGLE_CLIENT_SECRET" \
    --description "Google OAuth Client Secret for PerfectIt"

aws secretsmanager create-secret \
    --name "amplify/auth/FACEBOOK_APP_ID" \
    --secret-string "$FACEBOOK_APP_ID" \
    --description "Facebook OAuth App ID for PerfectIt"

aws secretsmanager create-secret \
    --name "amplify/auth/FACEBOOK_APP_SECRET" \
    --secret-string "$FACEBOOK_APP_SECRET" \
    --description "Facebook OAuth App Secret for PerfectIt"

echo "Secrets created successfully in AWS Secrets Manager"
```

#### Step 7: Local Development Configuration

**File:** `.env.local` (git-ignored)

```env
# OAuth Configuration for Local Development
NEXT_PUBLIC_OAUTH_DOMAIN=https://perfectit.auth.us-east-1.amazoncognito.com
NEXT_PUBLIC_REDIRECT_SIGN_IN=http://localhost:3000/oauth/callback
NEXT_PUBLIC_REDIRECT_SIGN_OUT=http://localhost:3000/

# These are public IDs, safe to commit (but we don't for consistency)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
NEXT_PUBLIC_FACEBOOK_APP_ID=your-facebook-app-id
```

### Part D: Frontend OAuth Integration

#### Step 8: Update Amplify Configuration

**File:** `src/amplifyconfiguration.ts`

```typescript
const config = {
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID!,
      userPoolClientId: process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID!,
      signUpVerificationMethod: 'code',
      loginWith: {
        oauth: {
          domain: process.env.NEXT_PUBLIC_OAUTH_DOMAIN!,
          scopes: ['openid', 'email', 'profile'],
          redirectSignIn: [process.env.NEXT_PUBLIC_REDIRECT_SIGN_IN!],
          redirectSignOut: [process.env.NEXT_PUBLIC_REDIRECT_SIGN_OUT!],
          responseType: 'code',
          providers: ['Google', 'Facebook'],
        },
        email: true,
      },
    },
  },
};

export default config;
```

## Testing & Validation

### Test Cases

1. **Email/Password Registration:**

   - Register with valid email
   - Receive verification code
   - Verify email successfully
   - Confirm user profile created in DynamoDB

2. **Google OAuth Flow:**

   - Click "Sign in with Google"
   - Redirect to Google login
   - Authorize and redirect back
   - Verify user created in Cognito
   - Verify profile created in DynamoDB

3. **Facebook OAuth Flow:**

   - Click "Sign in with Facebook"
   - Redirect to Facebook login
   - Authorize and redirect back
   - Verify user created in Cognito
   - Verify profile created in DynamoDB

4. **Password Policy:**

   - Try weak password: "password" (should fail)
   - Try valid password: "MyStr0ng!Pass" (should succeed)

5. **User Groups:**
   - Verify new users added to 'standard_user' group
   - Test admin can manually assign 'moderator' role

## Acceptance Criteria

### Technical Implementation:

- [ ] Cognito User Pool configured with required attributes
- [ ] Password policy enforced (8+ chars, upper, lower, number, symbol)
- [ ] Email verification enabled and working
- [ ] Google OAuth provider configured and functional
- [ ] Facebook OAuth provider configured and functional
- [ ] User groups (standard_user, moderator, admin) created
- [ ] Post-confirmation Lambda trigger creates user profile
- [ ] OAuth callback URLs properly configured

### User Experience:

- [ ] Users can register with email/password
- [ ] Users receive and can verify email
- [ ] "Sign in with Google" button works
- [ ] "Sign in with Facebook" button works
- [ ] Social login auto-populates user attributes
- [ ] Error messages are clear and helpful
- [ ] Loading states shown during authentication

### Security:

- [ ] Secrets stored in AWS Secrets Manager
- [ ] No credentials in source code
- [ ] HTTPS enforced for all OAuth redirects
- [ ] Token refresh handled automatically
- [ ] Session expiry configured appropriately

## Rollback Plan

If OAuth integration fails:

1. Disable social providers in Cognito console
2. Remove OAuth buttons from UI
3. Continue with email/password only
4. Fix issues in development environment
5. Re-enable when tested

## Common Issues & Solutions

| Issue                               | Solution                                                                                                   |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| "redirect_uri_mismatch" error       | Verify callback URLs match exactly in all three places (Google/Facebook console, Cognito, Frontend config) |
| Users not created in DynamoDB       | Check Lambda function logs in CloudWatch, verify table name environment variable                           |
| Social login attributes missing     | Review attribute mapping in Cognito console                                                                |
| "Invalid request" on OAuth callback | Ensure CORS is configured correctly in Amplify                                                             |
| Session expires too quickly         | Adjust token expiration in Cognito app client settings                                                     |

## Documentation Updates Required

1. Update README with OAuth setup instructions
2. Document environment variables in `.env.example`
3. Add OAuth troubleshooting guide
4. Create user authentication flow diagram
5. Document how to test OAuth locally

## Definition of Done

- [ ] All acceptance criteria met
- [ ] All test cases passing
- [ ] Documentation updated
- [ ] Code reviewed and approved
- [ ] Successfully deployed to development environment
- [ ] OAuth flow tested end-to-end in development
- [ ] Security review completed
- [ ] Rollback plan tested
