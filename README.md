# PerfectIt - Trading Card Collection Platform

A modern trading card collection and marketplace platform built with AWS Amplify Gen 2, Next.js 14, and Material-UI.

## Overview

PerfectIt is a comprehensive platform for collectors to create, showcase, and trade their unique card collections, with emphasis on perfection scores and community engagement.

## Tech Stack

- **Frontend**: Next.js 14.2.0 (App Router), React 18.3.0, TypeScript 5.3.3
- **UI Libraries**: Material-UI 5.15.0, AWS Amplify UI React 6.1.0
- **Backend**: AWS Amplify Gen 2
- **Database**: DynamoDB
- **Authentication**: AWS Cognito
- **API**: AWS AppSync (GraphQL)
- **Storage**: AWS S3 with CloudFront CDN
- **Search**: OpenSearch

## Project Structure

```
perfectit/
├── amplify/              # Backend configuration
│   ├── auth/            # Cognito authentication
│   ├── data/            # DynamoDB models & GraphQL schema
│   ├── functions/       # Lambda functions
│   ├── storage/         # S3 configuration
│   └── backend.ts       # Main backend configuration
├── app/                 # Next.js App Router
├── components/          # Shared React components
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
│   ├── amplify/        # Amplify configuration
│   └── theme/          # MUI theme configuration
├── types/              # TypeScript types
└── public/             # Static assets
```

## Prerequisites

- Node.js v20.11.0 or higher
- npm v10.2.0 or higher
- AWS CLI v2.15.0 or higher (configured with credentials)
- AWS Amplify CLI (latest version)

## Setup Instructions

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Initialize Amplify** (if not already done):
   ```bash
   amplify init
   ```

3. **Deploy the sandbox environment**:
   ```bash
   amplify sandbox
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser** and navigate to `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:unit` - Run unit tests
- `npm run test:e2e` - Run E2E tests

## Development Workflow

1. Code changes are automatically linted on commit via Husky pre-commit hooks
2. ESLint and Prettier ensure code quality and consistency
3. TypeScript provides type safety throughout the application

## Environment Configuration

Create a `.env.local` file for local development with required environment variables. The Amplify configuration is automatically handled by `amplify_outputs.json`.

## Deployment

The application uses AWS Amplify Hosting for deployment with automatic CI/CD:

1. Push changes to your repository
2. Amplify automatically builds and deploys to the configured environment
3. Preview environments are created for pull requests

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This library is licensed under the MIT-0 License. See the LICENSE file.