import { Page, Locator } from '@playwright/test';

export class LoginPage {
  private page: Page;

  // Locators
  private emailInput: Locator;
  private passwordInput: Locator;
  private submitButton: Locator;
  private errorAlert: Locator;
  private signUpLink: Locator;
  private pageHeading: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators
    this.emailInput = page.locator('input[name="email"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.submitButton = page.locator('button[type="submit"]');
    this.errorAlert = page.locator('[role="alert"]');
    this.signUpLink = page.locator('a:has-text("Sign Up")');
    this.pageHeading = page.locator('h1:has-text("Sign In")');
  }

  async goto() {
    await this.page.goto('/login');
    await this.pageHeading.waitFor({ state: 'visible' });
  }

  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  async submit() {
    await this.submitButton.click();
  }

  async login(email: string, password: string) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.submit();
  }

  async getErrorMessage(): Promise<string | null> {
    try {
      await this.errorAlert.waitFor({ state: 'visible', timeout: 2000 });
      return await this.errorAlert.textContent();
    } catch {
      return null;
    }
  }

  async isErrorVisible(): Promise<boolean> {
    return await this.errorAlert.isVisible();
  }

  async navigateToSignUp() {
    await this.signUpLink.click();
  }

  async waitForSuccessfulLogin(timeout: number = 10000) {
    await this.page.waitForURL('**/cards', { timeout });
  }

  async getFieldError(fieldName: 'email' | 'password'): Promise<string | null> {
    const field = fieldName === 'email' ? this.emailInput : this.passwordInput;
    const errorElement = field.locator('..').locator('p.Mui-error');

    if (await errorElement.isVisible()) {
      return await errorElement.textContent();
    }
    return null;
  }

  async isSubmitButtonDisabled(): Promise<boolean> {
    return await this.submitButton.isDisabled();
  }

  async getSubmitButtonText(): Promise<string> {
    return (await this.submitButton.textContent()) || '';
  }
}
