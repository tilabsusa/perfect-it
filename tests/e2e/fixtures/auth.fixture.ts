import { test as base } from '@playwright/test';

export interface AuthFixture {
  authenticatedUser: {
    email: string;
    password: string;
    username: string;
  };
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoggedIn: () => Promise<boolean>;
}

export const test = base.extend<{ auth: AuthFixture }>({
  auth: async ({ page }, use) => {
    const authenticatedUser = {
      email: process.env.TEST_USER_EMAIL || 'test@example.com',
      password: process.env.TEST_USER_PASSWORD || 'TestPassword123!',
      username: process.env.TEST_USER_USERNAME || 'testuser',
    };

    const login = async (email: string, password: string) => {
      await page.goto('/login');
      await page.fill('input[name="email"]', email);
      await page.fill('input[name="password"]', password);
      await page.click('button[type="submit"]');

      // Wait for navigation to complete
      await page.waitForURL('**/cards', { timeout: 10000 });
    };

    const logout = async () => {
      // Click on user menu or logout button
      await page.click('button:has-text("Logout")');
      await page.waitForURL('**/login', { timeout: 5000 });
    };

    const isLoggedIn = async () => {
      // Check if logout button is visible
      const logoutButton = page.locator('button:has-text("Logout")');
      return await logoutButton.isVisible().catch(() => false);
    };

    await use({
      authenticatedUser,
      login,
      logout,
      isLoggedIn,
    });
  },
});

export { expect } from '@playwright/test';
