# Story 1.6: Environment Configuration and Secrets Management

## Story Statement

As a developer,  
I want a secure and systematic way to manage configuration across all environments,  
so that sensitive data is protected and deployments are consistent and reliable.

## Priority: CRITICAL

This story must be completed before Story 1.5 (deployment pipeline) to ensure proper configuration management.

## Overview

This story establishes the complete environment configuration strategy using AWS Systems Manager Parameter Store and AWS Secrets Manager, with clear separation between public configuration and sensitive secrets.

## Implementation Plan

### Part A: Configuration Architecture

#### Configuration Categories

1. **Public Configuration** (Parameter Store - Standard)

   - API endpoints
   - Public bucket names
   - Feature flags
   - Application settings

2. **Sensitive Secrets** (Secrets Manager)

   - OAuth client secrets
   - API keys
   - Database credentials
   - JWT secrets

3. **Build-time Configuration** (Environment variables)
   - Node environment
   - Build flags
   - Public API URLs

### Part B: AWS Systems Manager Parameter Store Setup

#### Step 1: Create Parameter Store Hierarchy

**Script:** `scripts/setup-parameters.ts`

```typescript
import { SSMClient, PutParameterCommand } from '@aws-sdk/client-ssm';

const client = new SSMClient({ region: 'us-east-1' });

interface EnvironmentConfig {
  environment: 'dev' | 'staging' | 'prod';
  parameters: Record<string, string>;
}

const configurations: EnvironmentConfig[] = [
  {
    environment: 'dev',
    parameters: {
      '/perfectit/dev/api/endpoint': 'https://api-dev.perfectit.com',
      '/perfectit/dev/cdn/url': 'https://cdn-dev.perfectit.com',
      '/perfectit/dev/cognito/userPoolId': 'us-east-1_XXXXXXXXX',
      '/perfectit/dev/cognito/clientId': 'XXXXXXXXXXXXXXXXXXXXXXXXXX',
      '/perfectit/dev/s3/bucketName': 'perfectit-uploads-dev',
      '/perfectit/dev/features/enableComments': 'true',
      '/perfectit/dev/features/enableVoting': 'true',
      '/perfectit/dev/features/maintenanceMode': 'false',
    },
  },
  {
    environment: 'staging',
    parameters: {
      '/perfectit/staging/api/endpoint': 'https://api-staging.perfectit.com',
      '/perfectit/staging/cdn/url': 'https://cdn-staging.perfectit.com',
      '/perfectit/staging/cognito/userPoolId': 'us-east-1_YYYYYYYYY',
      '/perfectit/staging/cognito/clientId': 'YYYYYYYYYYYYYYYYYYYYYYYYYY',
      '/perfectit/staging/s3/bucketName': 'perfectit-uploads-staging',
      '/perfectit/staging/features/enableComments': 'true',
      '/perfectit/staging/features/enableVoting': 'true',
      '/perfectit/staging/features/maintenanceMode': 'false',
    },
  },
  {
    environment: 'prod',
    parameters: {
      '/perfectit/prod/api/endpoint': 'https://api.perfectit.com',
      '/perfectit/prod/cdn/url': 'https://cdn.perfectit.com',
      '/perfectit/prod/cognito/userPoolId': 'us-east-1_ZZZZZZZZZ',
      '/perfectit/prod/cognito/clientId': 'ZZZZZZZZZZZZZZZZZZZZZZZZZZ',
      '/perfectit/prod/s3/bucketName': 'perfectit-uploads-prod',
      '/perfectit/prod/features/enableComments': 'true',
      '/perfectit/prod/features/enableVoting': 'true',
      '/perfectit/prod/features/maintenanceMode': 'false',
    },
  },
];

async function setupParameters() {
  for (const config of configurations) {
    console.log(`Setting up parameters for ${config.environment} environment...`);

    for (const [key, value] of Object.entries(config.parameters)) {
      try {
        await client.send(
          new PutParameterCommand({
            Name: key,
            Value: value,
            Type: 'String',
            Overwrite: true,
            Description: `Configuration for ${key.split('/').pop()} in ${config.environment}`,
            Tags: [
              { Key: 'Environment', Value: config.environment },
              { Key: 'Project', Value: 'PerfectIt' },
              { Key: 'ManagedBy', Value: 'Amplify' },
            ],
          })
        );
        console.log(`✓ Created parameter: ${key}`);
      } catch (error) {
        console.error(`✗ Failed to create parameter ${key}:`, error);
      }
    }
  }
}

setupParameters();
```

### Part C: AWS Secrets Manager Setup

#### Step 2: Create Secrets Structure

**Script:** `scripts/setup-secrets.ts`

```typescript
import {
  SecretsManagerClient,
  CreateSecretCommand,
  UpdateSecretCommand,
} from '@aws-sdk/client-secrets-manager';
import * as readline from 'readline/promises';

const client = new SecretsManagerClient({ region: 'us-east-1' });
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

interface SecretConfig {
  name: string;
  description: string;
  promptText: string;
  isPassword?: boolean;
}

const secrets: Record<string, SecretConfig[]> = {
  dev: [
    {
      name: '/perfectit/dev/oauth/google/clientSecret',
      description: 'Google OAuth Client Secret for Development',
      promptText: 'Enter Google Client Secret (dev):',
      isPassword: true,
    },
    {
      name: '/perfectit/dev/oauth/facebook/appSecret',
      description: 'Facebook OAuth App Secret for Development',
      promptText: 'Enter Facebook App Secret (dev):',
      isPassword: true,
    },
    {
      name: '/perfectit/dev/jwt/secret',
      description: 'JWT Signing Secret for Development',
      promptText: 'Enter JWT Secret (dev) or press Enter to generate:',
      isPassword: true,
    },
  ],
  staging: [
    // Similar structure for staging
  ],
  prod: [
    // Similar structure for production
  ],
};

async function setupSecrets() {
  console.log('Setting up secrets in AWS Secrets Manager...\n');

  for (const [env, envSecrets] of Object.entries(secrets)) {
    console.log(`\nConfiguring ${env.toUpperCase()} environment secrets:`);
    console.log('='.repeat(50));

    for (const secret of envSecrets) {
      let value: string;

      if (secret.promptText.includes('generate')) {
        const input = await rl.question(secret.promptText);
        value = input || generateRandomSecret();
      } else {
        value = await rl.question(secret.promptText);
      }

      try {
        await client.send(
          new CreateSecretCommand({
            Name: secret.name,
            Description: secret.description,
            SecretString: value,
            Tags: [
              { Key: 'Environment', Value: env },
              { Key: 'Project', Value: 'PerfectIt' },
              { Key: 'Type', Value: 'OAuth' },
            ],
          })
        );
        console.log(`✓ Created secret: ${secret.name}`);
      } catch (error: any) {
        if (error.name === 'ResourceExistsException') {
          // Update existing secret
          await client.send(
            new UpdateSecretCommand({
              SecretId: secret.name,
              SecretString: value,
            })
          );
          console.log(`✓ Updated existing secret: ${secret.name}`);
        } else {
          console.error(`✗ Failed to create secret ${secret.name}:`, error.message);
        }
      }
    }
  }

  rl.close();
}

function generateRandomSecret(length = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

setupSecrets();
```

### Part D: Environment Files Configuration

#### Step 3: Create Environment Templates

**File:** `.env.example`

```bash
# This is a template for local development
# Copy this file to .env.local and fill in the values
# NEVER commit .env.local to source control

# Environment
NODE_ENV=development
NEXT_PUBLIC_ENVIRONMENT=dev

# AWS Configuration (Public)
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_USER_POOL_ID=us-east-1_XXXXXXXXX
NEXT_PUBLIC_USER_POOL_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_IDENTITY_POOL_ID=us-east-1:XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX

# OAuth Configuration (Public IDs only)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
NEXT_PUBLIC_FACEBOOK_APP_ID=your-facebook-app-id
NEXT_PUBLIC_OAUTH_DOMAIN=perfectit-dev.auth.us-east-1.amazoncognito.com
NEXT_PUBLIC_OAUTH_REDIRECT_SIGN_IN=http://localhost:3000/oauth/callback
NEXT_PUBLIC_OAUTH_REDIRECT_SIGN_OUT=http://localhost:3000/

# API Configuration
NEXT_PUBLIC_API_ENDPOINT=http://localhost:3000/api
NEXT_PUBLIC_GRAPHQL_ENDPOINT=http://localhost:20002/graphql

# Storage Configuration
NEXT_PUBLIC_S3_BUCKET=perfectit-uploads-dev
NEXT_PUBLIC_CDN_URL=http://localhost:3000

# Feature Flags
NEXT_PUBLIC_ENABLE_COMMENTS=true
NEXT_PUBLIC_ENABLE_VOTING=true
NEXT_PUBLIC_MAINTENANCE_MODE=false

# Local Development Only (Never used in production)
# These would come from Secrets Manager in deployed environments
LOCAL_GOOGLE_CLIENT_SECRET=your-google-client-secret-for-local-dev
LOCAL_FACEBOOK_APP_SECRET=your-facebook-app-secret-for-local-dev
LOCAL_JWT_SECRET=your-jwt-secret-for-local-dev
```

#### Step 4: Create Configuration Loader

**File:** `src/config/environment.ts`

```typescript
import { SSMClient, GetParameterCommand, GetParametersByPathCommand } from '@aws-sdk/client-ssm';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

export type Environment = 'dev' | 'staging' | 'prod' | 'local';

class ConfigurationManager {
  private static instance: ConfigurationManager;
  private ssmClient: SSMClient;
  private secretsClient: SecretsManagerClient;
  private cache: Map<string, any> = new Map();
  private environment: Environment;

  private constructor() {
    this.ssmClient = new SSMClient({ region: process.env.AWS_REGION || 'us-east-1' });
    this.secretsClient = new SecretsManagerClient({
      region: process.env.AWS_REGION || 'us-east-1',
    });
    this.environment = (process.env.NEXT_PUBLIC_ENVIRONMENT as Environment) || 'local';
  }

  static getInstance(): ConfigurationManager {
    if (!ConfigurationManager.instance) {
      ConfigurationManager.instance = new ConfigurationManager();
    }
    return ConfigurationManager.instance;
  }

  async getParameter(key: string): Promise<string | undefined> {
    if (this.environment === 'local') {
      return process.env[key];
    }

    const cacheKey = `param:${key}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const parameterPath = `/perfectit/${this.environment}/${key}`;
      const response = await this.ssmClient.send(
        new GetParameterCommand({
          Name: parameterPath,
          WithDecryption: true,
        })
      );

      const value = response.Parameter?.Value;
      if (value) {
        this.cache.set(cacheKey, value);
      }
      return value;
    } catch (error) {
      console.error(`Failed to get parameter ${key}:`, error);
      return undefined;
    }
  }

  async getSecret(key: string): Promise<string | undefined> {
    if (this.environment === 'local') {
      return process.env[`LOCAL_${key.toUpperCase().replace(/\//g, '_')}`];
    }

    const cacheKey = `secret:${key}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const secretPath = `/perfectit/${this.environment}/${key}`;
      const response = await this.secretsClient.send(
        new GetSecretValueCommand({
          SecretId: secretPath,
        })
      );

      const value = response.SecretString;
      if (value) {
        this.cache.set(cacheKey, value);
      }
      return value;
    } catch (error) {
      console.error(`Failed to get secret ${key}:`, error);
      return undefined;
    }
  }

  async getAllParameters(): Promise<Record<string, string>> {
    if (this.environment === 'local') {
      return process.env as Record<string, string>;
    }

    try {
      const response = await this.ssmClient.send(
        new GetParametersByPathCommand({
          Path: `/perfectit/${this.environment}/`,
          Recursive: true,
          WithDecryption: true,
        })
      );

      const parameters: Record<string, string> = {};
      response.Parameters?.forEach((param) => {
        if (param.Name && param.Value) {
          const key = param.Name.replace(`/perfectit/${this.environment}/`, '');
          parameters[key] = param.Value;
        }
      });

      return parameters;
    } catch (error) {
      console.error('Failed to get parameters:', error);
      return {};
    }
  }

  getEnvironment(): Environment {
    return this.environment;
  }

  isProduction(): boolean {
    return this.environment === 'prod';
  }

  isDevelopment(): boolean {
    return this.environment === 'dev' || this.environment === 'local';
  }
}

export const config = ConfigurationManager.getInstance();

// Type-safe configuration keys
export const ConfigKeys = {
  // Public configurations
  API_ENDPOINT: 'api/endpoint',
  CDN_URL: 'cdn/url',
  USER_POOL_ID: 'cognito/userPoolId',
  USER_POOL_CLIENT_ID: 'cognito/clientId',
  S3_BUCKET: 's3/bucketName',

  // Feature flags
  ENABLE_COMMENTS: 'features/enableComments',
  ENABLE_VOTING: 'features/enableVoting',
  MAINTENANCE_MODE: 'features/maintenanceMode',

  // Secrets
  GOOGLE_CLIENT_SECRET: 'oauth/google/clientSecret',
  FACEBOOK_APP_SECRET: 'oauth/facebook/appSecret',
  JWT_SECRET: 'jwt/secret',
} as const;
```

### Part E: Amplify Integration

#### Step 5: Configure Amplify Backend

**File:** `amplify/backend.ts`

```typescript
import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import * as iam from 'aws-cdk-lib/aws-iam';

const backend = defineBackend({
  auth,
  data,
  storage,
});

// Grant Lambda functions access to Parameter Store
const parameterStorePolicy = new iam.PolicyStatement({
  actions: ['ssm:GetParameter', 'ssm:GetParameters', 'ssm:GetParametersByPath'],
  resources: [`arn:aws:ssm:${backend.stack.region}:${backend.stack.account}:parameter/perfectit/*`],
});

// Grant Lambda functions access to Secrets Manager
const secretsManagerPolicy = new iam.PolicyStatement({
  actions: ['secretsmanager:GetSecretValue'],
  resources: [
    `arn:aws:secretsmanager:${backend.stack.region}:${backend.stack.account}:secret:/perfectit/*`,
  ],
});

// Apply policies to all Lambda functions
Object.values(backend.resources).forEach((resource) => {
  if (resource.lambda) {
    resource.lambda.addToRolePolicy(parameterStorePolicy);
    resource.lambda.addToRolePolicy(secretsManagerPolicy);
  }
});
```

### Part F: CI/CD Pipeline Configuration

#### Step 6: GitHub Actions Secrets Setup

**Documentation:** `docs/deployment/github-secrets.md`

````markdown
# GitHub Secrets Configuration

The following secrets must be configured in GitHub repository settings:

## Required Secrets

### AWS Credentials

- `AWS_ACCESS_KEY_ID`: IAM user access key for deployments
- `AWS_SECRET_ACCESS_KEY`: IAM user secret key for deployments
- `AWS_REGION`: AWS region (us-east-1)

### Environment-Specific Secrets

For each environment (DEV, STAGING, PROD), create:

- `{ENV}_USER_POOL_ID`: Cognito User Pool ID
- `{ENV}_USER_POOL_CLIENT_ID`: Cognito App Client ID
- `{ENV}_IDENTITY_POOL_ID`: Cognito Identity Pool ID
- `{ENV}_S3_BUCKET`: S3 bucket for uploads
- `{ENV}_CLOUDFRONT_DISTRIBUTION_ID`: CloudFront distribution ID

## Setting Secrets via GitHub CLI

```bash
# Install GitHub CLI if not already installed
# brew install gh (macOS) or see https://cli.github.com/

# Authenticate with GitHub
gh auth login

# Set secrets
gh secret set AWS_ACCESS_KEY_ID --body "YOUR_ACCESS_KEY"
gh secret set AWS_SECRET_ACCESS_KEY --body "YOUR_SECRET_KEY"
gh secret set AWS_REGION --body "us-east-1"

# Set environment-specific secrets
gh secret set DEV_USER_POOL_ID --body "us-east-1_XXXXXXXXX"
# ... repeat for all secrets
```
````

````

### Part G: Local Development Setup

#### Step 7: Developer Setup Script
**File:** `scripts/setup-local-env.sh`

```bash
#!/bin/bash

echo "PerfectIt Local Environment Setup"
echo "=================================="
echo

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "Node.js is required but not installed. Aborting." >&2; exit 1; }
command -v aws >/dev/null 2>&1 || { echo "AWS CLI is required but not installed. Aborting." >&2; exit 1; }

# Check if .env.local exists
if [ -f .env.local ]; then
    echo "⚠️  .env.local already exists. Backup will be created as .env.local.backup"
    cp .env.local .env.local.backup
fi

# Copy template
cp .env.example .env.local

echo "📝 Please edit .env.local with your configuration values."
echo "   You'll need:"
echo "   - AWS Cognito IDs (from AWS Console)"
echo "   - OAuth Client IDs (from Google/Facebook)"
echo "   - Local development secrets"
echo

# Fetch configuration from Parameter Store (if AWS is configured)
if aws sts get-caller-identity >/dev/null 2>&1; then
    echo "🔄 Fetching configuration from AWS Parameter Store..."
    node scripts/fetch-local-config.js
    echo "✅ Configuration fetched successfully"
else
    echo "⚠️  AWS CLI not configured. Skipping Parameter Store sync."
    echo "   Run 'aws configure' to set up AWS access."
fi

echo
echo "✅ Local environment setup complete!"
echo "   Next steps:"
echo "   1. Edit .env.local with your values"
echo "   2. Run 'npm install' to install dependencies"
echo "   3. Run 'npm run dev' to start development server"
````

## Testing & Validation

### Validation Checklist

1. **Parameter Store Access:**

   ```bash
   aws ssm get-parameter --name "/perfectit/dev/api/endpoint"
   ```

2. **Secrets Manager Access:**

   ```bash
   aws secretsmanager get-secret-value --secret-id "/perfectit/dev/jwt/secret"
   ```

3. **Local Environment:**

   - Verify .env.local is created
   - Confirm all required variables are set
   - Test configuration loading in application

4. **Lambda Access:**

   - Deploy a test Lambda
   - Verify it can read parameters and secrets
   - Check CloudWatch logs for errors

5. **Environment Isolation:**
   - Confirm dev cannot access prod secrets
   - Verify staging uses staging configuration
   - Test production has restricted access

## Acceptance Criteria

### Implementation Complete:

- [ ] Parameter Store hierarchy created for all environments
- [ ] Secrets Manager secrets created and populated
- [ ] Configuration manager class implemented
- [ ] Environment templates created (.env.example)
- [ ] Local setup script functional
- [ ] Lambda functions have proper IAM permissions
- [ ] GitHub Actions secrets documented

### Security Requirements:

- [ ] No secrets in source code
- [ ] Secrets encrypted at rest
- [ ] Environment isolation enforced
- [ ] Audit logging enabled
- [ ] Least privilege IAM policies

### Developer Experience:

- [ ] Clear setup documentation
- [ ] One-command local setup
- [ ] Helpful error messages
- [ ] Configuration caching implemented
- [ ] Type-safe configuration keys

## Rollback Plan

If configuration system fails:

1. Revert to hardcoded development values (temporary)
2. Document all configuration values needed
3. Manual configuration in each environment
4. Fix issues in isolated environment
5. Gradually migrate to new system

## Common Issues & Solutions

| Issue                              | Solution                                                                  |
| ---------------------------------- | ------------------------------------------------------------------------- |
| "Access Denied" to Parameter Store | Check IAM permissions, ensure correct path prefix                         |
| Secrets not loading in Lambda      | Verify Lambda execution role has secretsmanager:GetSecretValue permission |
| Environment variables not set      | Check .env.local exists and is properly formatted                         |
| Cache stale after update           | Implement cache TTL or manual cache clear                                 |
| Local dev can't access AWS         | Use LOCAL\_ prefixed environment variables                                |

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Configuration works in all environments
- [ ] Documentation complete and accurate
- [ ] Security review passed
- [ ] Team trained on configuration management
- [ ] Rollback plan tested
- [ ] Monitoring configured for configuration errors
