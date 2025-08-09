# Story 1.1a: Testing Infrastructure Setup

## Story Statement

As a developer,  
I want a comprehensive testing infrastructure from the project start,  
so that we can maintain code quality, prevent regressions, and ensure reliable deployments through automated testing at all levels.

## Priority: HIGH

This story should be completed immediately after Story 1.1 to ensure all subsequent development includes proper testing.

## Testing Strategy Overview

```
Unit Tests (Jest) → Integration Tests (Jest + MSW) → E2E Tests (Playwright) → Visual Regression (Percy)
                                    ↓
                            CI/CD Pipeline (GitHub Actions)
                                    ↓
                            Quality Gates & Reports
```

## Implementation Plan

### Part A: Jest Configuration for Unit & Integration Tests

#### Step 1: Install Testing Dependencies

**File:** `package.json`

```json
{
  "devDependencies": {
    "@testing-library/react": "^14.1.2",
    "@testing-library/jest-dom": "^6.1.5",
    "@testing-library/user-event": "^14.5.1",
    "@types/jest": "^29.5.11",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "ts-jest": "^29.1.1",
    "msw": "^2.0.11",
    "@aws-amplify/backend": "^1.0.0",
    "aws-sdk-client-mock": "^3.0.1",
    "aws-sdk-client-mock-jest": "^3.0.1"
  }
}
```

#### Step 2: Configure Jest

**File:** `jest.config.js`

```javascript
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
});

const customJestConfig = {
  // Test environment
  testEnvironment: 'jest-environment-jsdom',

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Module name mapper for absolute imports and module aliases
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@amplify/(.*)$': '<rootDir>/amplify/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/index.{js,jsx,ts,tsx}',
    '!src/app/**/layout.tsx',
    '!src/app/**/page.tsx',
  ],

  coverageThresholds: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // Test match patterns
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}',
    '<rootDir>/amplify/**/*.test.{js,jsx,ts,tsx}',
  ],

  // Transform files
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react-jsx',
        },
      },
    ],
  },

  // Ignore patterns
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/', '<rootDir>/.amplify/'],

  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // Verbose output
  verbose: true,
};

module.exports = createJestConfig(customJestConfig);
```

#### Step 3: Jest Setup File

**File:** `jest.setup.js`

```javascript
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import { mockClient } from 'aws-sdk-client-mock';
import 'aws-sdk-client-mock-jest';

// Polyfills for Node.js environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords() {
    return [];
  }
};

// Mock Amplify for tests
jest.mock('aws-amplify', () => ({
  Amplify: {
    configure: jest.fn(),
  },
  Auth: {
    currentAuthenticatedUser: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
    signUp: jest.fn(),
  },
  Storage: {
    put: jest.fn(),
    get: jest.fn(),
    remove: jest.fn(),
  },
}));

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Suppress console errors in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('Warning: ReactDOM.render')) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
```

### Part B: Mock Service Worker (MSW) Setup

#### Step 4: Configure MSW for API Mocking

**File:** `src/mocks/handlers.ts`

```typescript
import { http, HttpResponse, graphql } from 'msw';

// REST API handlers
export const restHandlers = [
  http.get('/api/health', () => {
    return HttpResponse.json({ status: 'healthy' });
  }),

  http.post('/api/images/upload', async ({ request }) => {
    const data = await request.formData();
    const file = data.get('file') as File;

    if (!file) {
      return HttpResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    return HttpResponse.json({
      key: `uploads/test/${Date.now()}-${file.name}`,
      url: `https://cdn.perfectit.com/uploads/test/${file.name}`,
    });
  }),
];

// GraphQL handlers
export const graphqlHandlers = [
  graphql.query('GetPerfectionCard', ({ variables }) => {
    return HttpResponse.json({
      data: {
        getPerfectionCard: {
          id: variables.id,
          title: 'Test Perfection Card',
          description: 'Test description',
          imageUrl: 'https://cdn.perfectit.com/test.jpg',
          createdAt: '2024-01-01T00:00:00Z',
          author: {
            id: 'user-1',
            username: 'testuser',
            reputationScore: 100,
          },
        },
      },
    });
  }),

  graphql.mutation('CreatePerfectionCard', ({ variables }) => {
    return HttpResponse.json({
      data: {
        createPerfectionCard: {
          id: 'card-123',
          ...variables.input,
          createdAt: new Date().toISOString(),
        },
      },
    });
  }),
];

export const handlers = [...restHandlers, ...graphqlHandlers];
```

#### Step 5: MSW Server Setup

**File:** `src/mocks/server.ts`

```typescript
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);

// Enable request interception
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));

// Reset handlers between tests
afterEach(() => server.resetHandlers());

// Clean up
afterAll(() => server.close());
```

### Part C: Testing Utilities and Helpers

#### Step 6: Create Testing Utilities

**File:** `src/test-utils/index.tsx`

```typescript
import React, { ReactElement } from 'react';
import { render as rtlRender, RenderOptions } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { Authenticator } from '@aws-amplify/ui-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { theme } from '@/theme';
import userEvent from '@testing-library/user-event';

// Create a custom render function that includes providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  isAuthenticated?: boolean;
  queryClient?: QueryClient;
}

function AllTheProviders({
  children,
  isAuthenticated = false,
  queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
}: {
  children: React.ReactNode;
  isAuthenticated?: boolean;
  queryClient?: QueryClient;
}) {
  if (isAuthenticated) {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <Authenticator.Provider>
            {children}
          </Authenticator.Provider>
        </ThemeProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}

function customRender(
  ui: ReactElement,
  {
    isAuthenticated = false,
    queryClient,
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  return rtlRender(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders isAuthenticated={isAuthenticated} queryClient={queryClient}>
        {children}
      </AllTheProviders>
    ),
    ...renderOptions,
  });
}

// Re-export everything
export * from '@testing-library/react';
export { customRender as render, userEvent };

// Test data factories
export * from './factories';
```

#### Step 7: Test Data Factories

**File:** `src/test-utils/factories.ts`

```typescript
export const createMockUser = (overrides = {}) => ({
  id: 'user-123',
  email: 'test@example.com',
  username: 'testuser',
  createdAt: '2024-01-01T00:00:00Z',
  reputationScore: 0,
  cardsCreated: 0,
  ...overrides,
});

export const createMockPerfectionCard = (overrides = {}) => ({
  id: 'card-123',
  title: 'Test Perfection Card',
  description: 'This is a test description',
  imageUrl: 'https://cdn.perfectit.com/test.jpg',
  category: 'furniture',
  difficulty: 'intermediate',
  timeEstimate: '2 hours',
  costEstimate: '$50',
  materials: ['Wood glue', 'Sandpaper'],
  tools: ['Drill', 'Saw'],
  instructions: ['Step 1', 'Step 2', 'Step 3'],
  upvotes: 10,
  downvotes: 2,
  viewCount: 100,
  createdAt: '2024-01-01T00:00:00Z',
  author: createMockUser(),
  ...overrides,
});

export const createMockComment = (overrides = {}) => ({
  id: 'comment-123',
  content: 'Great tutorial!',
  createdAt: '2024-01-01T00:00:00Z',
  author: createMockUser(),
  upvotes: 5,
  downvotes: 0,
  ...overrides,
});
```

### Part D: Example Component Tests

#### Step 8: Component Unit Test Example

**File:** `src/components/PerfectionCard/__tests__/PerfectionCard.test.tsx`

```typescript
import { render, screen, userEvent } from '@/test-utils';
import { PerfectionCard } from '../PerfectionCard';
import { createMockPerfectionCard } from '@/test-utils/factories';

describe('PerfectionCard', () => {
  const mockCard = createMockPerfectionCard();
  const mockOnVote = jest.fn();
  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders card information correctly', () => {
    render(
      <PerfectionCard
        card={mockCard}
        onVote={mockOnVote}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText(mockCard.title)).toBeInTheDocument();
    expect(screen.getByText(mockCard.description)).toBeInTheDocument();
    expect(screen.getByText(`By ${mockCard.author.username}`)).toBeInTheDocument();
  });

  it('displays vote counts', () => {
    render(
      <PerfectionCard
        card={mockCard}
        onVote={mockOnVote}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText(mockCard.upvotes.toString())).toBeInTheDocument();
    expect(screen.getByText(mockCard.downvotes.toString())).toBeInTheDocument();
  });

  it('calls onVote when vote button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <PerfectionCard
        card={mockCard}
        onVote={mockOnVote}
        onSave={mockOnSave}
      />
    );

    const upvoteButton = screen.getByLabelText('Upvote');
    await user.click(upvoteButton);

    expect(mockOnVote).toHaveBeenCalledWith(mockCard.id, 'up');
  });

  it('calls onSave when save button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <PerfectionCard
        card={mockCard}
        onVote={mockOnVote}
        onSave={mockOnSave}
      />
    );

    const saveButton = screen.getByLabelText('Save to collection');
    await user.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith(mockCard.id);
  });

  it('shows loading skeleton when card is loading', () => {
    render(
      <PerfectionCard
        card={null}
        isLoading={true}
        onVote={mockOnVote}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByTestId('card-skeleton')).toBeInTheDocument();
  });

  it('applies correct difficulty color', () => {
    const beginnerCard = createMockPerfectionCard({ difficulty: 'beginner' });
    const { rerender } = render(
      <PerfectionCard
        card={beginnerCard}
        onVote={mockOnVote}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText('beginner')).toHaveClass('MuiChip-colorSuccess');

    const expertCard = createMockPerfectionCard({ difficulty: 'expert' });
    rerender(
      <PerfectionCard
        card={expertCard}
        onVote={mockOnVote}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText('expert')).toHaveClass('MuiChip-colorError');
  });
});
```

### Part E: Playwright E2E Testing Setup

#### Step 9: Install and Configure Playwright

**File:** `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```

#### Step 10: E2E Test Helpers

**File:** `e2e/helpers/auth.ts`

```typescript
import { Page, expect } from '@playwright/test';

export async function login(page: Page, email: string, password: string) {
  await page.goto('/auth/signin');
  await page.fill('[name="email"]', email);
  await page.fill('[name="password"]', password);
  await page.click('button[type="submit"]');

  // Wait for redirect after successful login
  await expect(page).toHaveURL('/dashboard');
}

export async function logout(page: Page) {
  await page.click('[data-testid="user-menu"]');
  await page.click('[data-testid="logout-button"]');
  await expect(page).toHaveURL('/');
}

export async function signUp(page: Page, email: string, password: string, username: string) {
  await page.goto('/auth/signup');
  await page.fill('[name="email"]', email);
  await page.fill('[name="username"]', username);
  await page.fill('[name="password"]', password);
  await page.fill('[name="confirmPassword"]', password);
  await page.click('button[type="submit"]');

  // Handle email verification in test environment
  if (process.env.NODE_ENV === 'test') {
    // Auto-verify in test environment
    await page.goto('/auth/verify?code=123456');
  }
}
```

#### Step 11: E2E Test Example

**File:** `e2e/perfection-card.spec.ts`

```typescript
import { test, expect } from '@playwright/test';
import { login } from './helpers/auth';

test.describe('Perfection Card Creation', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'test@example.com', 'Test123!@#');
  });

  test('should create a new perfection card', async ({ page }) => {
    // Navigate to create page
    await page.goto('/cards/create');

    // Fill in basic information
    await page.fill('[name="title"]', 'Restore Vintage Chair');
    await page.fill('[name="description"]', 'Complete guide to restoring a vintage wooden chair');
    await page.selectOption('[name="category"]', 'furniture');

    // Upload image
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('e2e/fixtures/chair.jpg');

    // Wait for image preview
    await expect(page.locator('[data-testid="image-preview"]')).toBeVisible();

    // Add materials
    await page.click('[data-testid="add-material"]');
    await page.fill('[name="materials[0].name"]', 'Wood stain');
    await page.fill('[name="materials[0].quantity"]', '1 quart');

    // Add tools
    await page.click('[data-testid="add-tool"]');
    await page.fill('[name="tools[0]"]', 'Sandpaper (various grits)');

    // Add instructions
    await page.fill('[name="instructions[0]"]', 'Remove old finish with sandpaper');
    await page.click('[data-testid="add-instruction"]');
    await page.fill('[name="instructions[1]"]', 'Apply wood stain evenly');

    // Set metadata
    await page.selectOption('[name="difficulty"]', 'intermediate');
    await page.fill('[name="timeEstimate"]', '4 hours');
    await page.fill('[name="costEstimate"]', '$75');

    // Submit form
    await page.click('button[type="submit"]');

    // Verify success
    await expect(page).toHaveURL(/\/cards\/[a-zA-Z0-9-]+/);
    await expect(page.locator('h1')).toHaveText('Restore Vintage Chair');
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/cards/create');

    // Try to submit without filling required fields
    await page.click('button[type="submit"]');

    // Check for validation errors
    await expect(page.locator('[data-testid="title-error"]')).toHaveText('Title is required');
    await expect(page.locator('[data-testid="description-error"]')).toHaveText(
      'Description is required'
    );
    await expect(page.locator('[data-testid="image-error"]')).toHaveText('Image is required');
  });

  test('should save draft and resume later', async ({ page }) => {
    await page.goto('/cards/create');

    // Fill partial information
    await page.fill('[name="title"]', 'Draft Card Title');
    await page.fill('[name="description"]', 'This is a draft');

    // Save draft
    await page.click('[data-testid="save-draft"]');
    await expect(page.locator('[data-testid="draft-saved"]')).toBeVisible();

    // Navigate away and come back
    await page.goto('/dashboard');
    await page.goto('/cards/drafts');

    // Find and click on draft
    await page.click('text=Draft Card Title');

    // Verify draft content is restored
    await expect(page.locator('[name="title"]')).toHaveValue('Draft Card Title');
    await expect(page.locator('[name="description"]')).toHaveValue('This is a draft');
  });
});
```

### Part F: CI/CD Integration

#### Step 12: GitHub Actions Test Workflow

**File:** `.github/workflows/test.yml`

```yaml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  unit-tests:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:unit

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
          flags: unittests
          name: codecov-umbrella

      - name: Archive test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: unit-test-results
          path: coverage/

  integration-tests:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run integration tests
        run: npm run test:integration
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.TEST_AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.TEST_AWS_SECRET_ACCESS_KEY }}

      - name: Archive test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: integration-test-results
          path: test-results/

  e2e-tests:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps

      - name: Build application
        run: npm run build
        env:
          NEXT_PUBLIC_ENVIRONMENT: test

      - name: Run Playwright tests
        run: npx playwright test
        env:
          PLAYWRIGHT_BASE_URL: http://localhost:3000

      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30

  test-summary:
    runs-on: ubuntu-latest
    needs: [unit-tests, integration-tests, e2e-tests]
    if: always()

    steps:
      - name: Test Summary
        run: |
          echo "## Test Results Summary" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "| Test Type | Status |" >> $GITHUB_STEP_SUMMARY
          echo "|-----------|--------|" >> $GITHUB_STEP_SUMMARY
          echo "| Unit Tests | ${{ needs.unit-tests.result }} |" >> $GITHUB_STEP_SUMMARY
          echo "| Integration Tests | ${{ needs.integration-tests.result }} |" >> $GITHUB_STEP_SUMMARY
          echo "| E2E Tests | ${{ needs.e2e-tests.result }} |" >> $GITHUB_STEP_SUMMARY
```

### Part G: NPM Scripts

#### Step 13: Update Package.json Scripts

**File:** `package.json`

```json
{
  "scripts": {
    "test": "jest --coverage",
    "test:unit": "jest --testPathPattern=src --coverage",
    "test:integration": "jest --testPathPattern=integration --coverage",
    "test:watch": "jest --watch",
    "test:ci": "jest --ci --coverage --maxWorkers=2",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:codegen": "playwright codegen",
    "test:all": "npm run test:unit && npm run test:integration && npm run test:e2e",
    "coverage": "jest --coverage && open coverage/lcov-report/index.html",
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "type-check": "tsc --noEmit"
  }
}
```

## Testing Standards & Best Practices

### Test Organization

- **Unit Tests:** Next to component files in `__tests__` folders
- **Integration Tests:** In `src/integration-tests/` directory
- **E2E Tests:** In `e2e/` directory at project root

### Naming Conventions

- Test files: `ComponentName.test.tsx` or `function.test.ts`
- Test suites: Describe the component/function being tested
- Test cases: Start with "should" or "it"

### Coverage Requirements

- Minimum 70% coverage for all metrics
- Critical paths require 90% coverage
- New code must include tests

### Testing Checklist for New Features

- [ ] Unit tests for all components
- [ ] Integration tests for API calls
- [ ] E2E tests for critical user flows
- [ ] Error scenarios tested
- [ ] Loading states tested
- [ ] Accessibility tested

## Acceptance Criteria

### Setup Complete

- [ ] Jest configured and working
- [ ] MSW configured for API mocking
- [ ] Playwright installed and configured
- [ ] Test utilities created
- [ ] CI/CD pipeline includes tests
- [ ] Coverage reporting configured

### Documentation

- [ ] Testing guide written
- [ ] Example tests provided
- [ ] CI/CD documentation updated
- [ ] Coverage thresholds documented

### Team Readiness

- [ ] Team trained on testing tools
- [ ] Testing standards agreed upon
- [ ] Review process includes test coverage

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Tests run successfully locally
- [ ] Tests run in CI/CD pipeline
- [ ] Coverage meets thresholds
- [ ] Documentation complete
- [ ] Team onboarded
