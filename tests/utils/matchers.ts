import { expect } from '@jest/globals';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeGraphQLSuccess(expectedData?: any): R;
      toBeGraphQLError(expectedError?: string): R;
      toHaveGraphQLData(expectedData: any): R;
      toHaveGraphQLErrors(): R;
    }
  }
}

/**
 * Custom matcher to check if a GraphQL response is successful
 */
expect.extend({
  toBeGraphQLSuccess(received: any, expectedData?: any) {
    const pass = received && received.data && !received.errors;

    if (pass && expectedData) {
      const dataMatches = JSON.stringify(received.data) === JSON.stringify(expectedData);
      if (!dataMatches) {
        return {
          message: () =>
            `Expected GraphQL data to match:\n` +
            `Expected: ${JSON.stringify(expectedData, null, 2)}\n` +
            `Received: ${JSON.stringify(received.data, null, 2)}`,
          pass: false,
        };
      }
    }

    if (pass) {
      return {
        message: () =>
          `Expected GraphQL response not to be successful, but it was:\n` +
          `${JSON.stringify(received, null, 2)}`,
        pass: true,
      };
    } else {
      return {
        message: () => {
          if (!received) {
            return 'Expected GraphQL response to be successful, but received undefined';
          }
          if (!received.data) {
            return 'Expected GraphQL response to have data field';
          }
          if (received.errors) {
            return `Expected GraphQL response to be successful, but got errors:\n${JSON.stringify(received.errors, null, 2)}`;
          }
          return 'Expected GraphQL response to be successful';
        },
        pass: false,
      };
    }
  },

  /**
   * Custom matcher to check if a GraphQL response has errors
   */
  toBeGraphQLError(received: any, expectedError?: string) {
    const hasErrors = received && received.errors && received.errors.length > 0;

    if (hasErrors && expectedError) {
      const errorMessages = received.errors.map((e: any) => e.message);
      const hasExpectedError = errorMessages.some((msg: string) => msg.includes(expectedError));

      if (!hasExpectedError) {
        return {
          message: () =>
            `Expected GraphQL error to contain "${expectedError}", but got:\n` +
            `${errorMessages.join('\n')}`,
          pass: false,
        };
      }
    }

    if (hasErrors) {
      return {
        message: () =>
          `Expected GraphQL response not to have errors, but it did:\n` +
          `${JSON.stringify(received.errors, null, 2)}`,
        pass: true,
      };
    } else {
      return {
        message: () => {
          if (!received) {
            return 'Expected GraphQL response to have errors, but received undefined';
          }
          if (!received.errors || received.errors.length === 0) {
            return 'Expected GraphQL response to have errors, but none were found';
          }
          return 'Expected GraphQL response to have errors';
        },
        pass: false,
      };
    }
  },

  /**
   * Custom matcher to check if GraphQL response contains specific data
   */
  toHaveGraphQLData(received: any, expectedData: any) {
    if (!received || !received.data) {
      return {
        message: () => 'Expected GraphQL response to have data field',
        pass: false,
      };
    }

    const actualData = received.data;
    let pass = true;
    let failureMessage = '';

    // Check if expectedData properties exist in actualData
    for (const key in expectedData) {
      if (!(key in actualData)) {
        pass = false;
        failureMessage = `Expected data to have property "${key}"`;
        break;
      }

      const expected = expectedData[key];
      const actual = actualData[key];

      if (typeof expected === 'object' && expected !== null) {
        // Deep comparison for objects
        if (JSON.stringify(expected) !== JSON.stringify(actual)) {
          pass = false;
          failureMessage =
            `Expected data.${key} to match:\n` +
            `Expected: ${JSON.stringify(expected, null, 2)}\n` +
            `Received: ${JSON.stringify(actual, null, 2)}`;
          break;
        }
      } else if (expected !== actual) {
        pass = false;
        failureMessage = `Expected data.${key} to be ${expected}, but got ${actual}`;
        break;
      }
    }

    if (pass) {
      return {
        message: () =>
          `Expected GraphQL data not to contain:\n` + `${JSON.stringify(expectedData, null, 2)}`,
        pass: true,
      };
    } else {
      return {
        message: () => failureMessage,
        pass: false,
      };
    }
  },

  /**
   * Custom matcher to check if GraphQL response has any errors
   */
  toHaveGraphQLErrors(received: any) {
    const hasErrors = received && received.errors && received.errors.length > 0;

    if (hasErrors) {
      return {
        message: () =>
          `Expected GraphQL response not to have errors, but found:\n` +
          `${JSON.stringify(received.errors, null, 2)}`,
        pass: true,
      };
    } else {
      return {
        message: () => 'Expected GraphQL response to have errors, but none were found',
        pass: false,
      };
    }
  },
});

export {};
