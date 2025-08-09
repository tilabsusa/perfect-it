import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

/**
 * Custom theme for testing
 */
const testTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

/**
 * Provider wrapper for tests
 */
interface TestProviderProps {
  children: React.ReactNode;
  theme?: any;
}

const TestProvider: React.FC<TestProviderProps> = ({ children, theme = testTheme }) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

/**
 * Custom render function that includes providers
 */
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { theme?: any }
) => {
  const { theme, ...renderOptions } = options || {};

  return render(ui, {
    wrapper: ({ children }) => <TestProvider theme={theme}>{children}</TestProvider>,
    ...renderOptions,
  });
};

/**
 * Re-export everything from React Testing Library
 */
export * from '@testing-library/react';

/**
 * Override the default render with our custom one
 */
export { customRender as render };

/**
 * Utility to wait for async operations
 */
export const waitForAsync = () => {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
};

/**
 * Mock router push function for Next.js
 */
export const mockRouterPush = jest.fn();

/**
 * Mock Next.js router
 */
export const mockRouter = {
  push: mockRouterPush,
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  reload: jest.fn(),
  forward: jest.fn(),
  pathname: '/',
  query: {},
  asPath: '/',
  route: '/',
  basePath: '',
  locale: 'en',
  locales: ['en'],
  defaultLocale: 'en',
  isLocaleDomain: false,
  isReady: true,
  isPreview: false,
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
};

/**
 * Setup mock router for tests
 */
export const setupMockRouter = () => {
  jest.mock('next/navigation', () => ({
    useRouter: () => mockRouter,
    usePathname: () => mockRouter.pathname,
    useSearchParams: () => new URLSearchParams(mockRouter.query as any),
  }));
};

/**
 * Reset all router mocks
 */
export const resetRouterMocks = () => {
  mockRouterPush.mockClear();
  mockRouter.replace.mockClear();
  mockRouter.prefetch.mockClear();
  mockRouter.back.mockClear();
  mockRouter.reload.mockClear();
  mockRouter.forward.mockClear();
};
