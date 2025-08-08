import '@testing-library/jest-dom';

// MSW setup temporarily disabled due to module resolution issues with v2.10.4
// The server.ts file has a fallback implementation to prevent test failures
// Uncomment below when MSW configuration is fixed
/*
const { server } = require('./mocks/server');

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
*/
