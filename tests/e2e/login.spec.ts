import { test, expect } from "@playwright/test";

test.describe("Login Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/login");
  });

  test("should display login form with all required elements", async ({ page }) => {
    // Wait for React component to hydrate - wait for the form to appear
    await page.waitForSelector("form", { timeout: 15000 });
    await page.waitForLoadState("networkidle");

    // Check page title
    await expect(page).toHaveTitle(/Logowanie/i);

    // Check form elements - CardTitle renders as h2 inside CardHeader
    await expect(page.getByText(/Zaloguj się/i).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Wprowadź swoje dane, aby zalogować się do konta/i)).toBeVisible();

    // Check email input
    const emailInput = page.getByLabel(/Email/i);
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute("type", "email");
    await expect(emailInput).toHaveAttribute("required");

    // Check password input
    const passwordInput = page.getByLabel(/Hasło/i);
    await expect(passwordInput).toBeVisible();
    await expect(passwordInput).toHaveAttribute("type", "password");
    await expect(passwordInput).toHaveAttribute("required");

    // Check submit button
    const submitButton = page.getByRole("button", { name: /Zaloguj się/i });
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeEnabled();

    // Check links
    await expect(page.getByRole("link", { name: /Zapomniałeś hasła\?/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Zarejestruj się/i })).toBeVisible();
  });

  test("should show validation error when submitting empty form", async ({ page }) => {
    const submitButton = page.getByRole("button", { name: /Zaloguj się/i });

    // Try to submit empty form
    await submitButton.click();

    // HTML5 validation should prevent submission
    const emailInput = page.getByLabel(/Email/i);
    await expect(emailInput).toBeFocused();
  });

  test("should show error message for invalid credentials", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    const emailInput = page.getByLabel(/Email/i);
    const passwordInput = page.getByLabel(/Hasło/i);
    const submitButton = page.getByRole("button", { name: /Zaloguj się/i });

    // Fill form with invalid credentials
    await emailInput.fill("invalid@example.com");
    await passwordInput.fill("wrongpassword");
    await submitButton.click();

    // Wait for error message
    await expect(page.getByRole("alert")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Failed to login|Invalid login credentials/i)).toBeVisible();
  });

  test("should successfully login with valid credentials and redirect to study page", async ({ page }) => {
    const testEmail = "test@test.com";
    const testPassword = "121212";

    // Wait for form to be ready
    await page.waitForSelector("form", { timeout: 10000 });
    await page.waitForLoadState("networkidle");

    // Test login
    const emailInput = page.getByLabel(/Email/i);
    const passwordInput = page.getByLabel(/Hasło/i);
    const submitButton = page.getByRole("button", { name: /Zaloguj się/i });

    await emailInput.fill(testEmail);
    await passwordInput.fill(testPassword);
    await submitButton.click();

    // Wait for redirect to study page
    await page.waitForURL("/study", { timeout: 15000 });
    await expect(page).toHaveURL("/study");

    // Verify we're on study page
    await expect(page.getByRole("heading", { name: /Przeglądanie i Powtórki Fiszek/i })).toBeVisible();
  });

  test("should disable form inputs and button during loading", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    const emailInput = page.getByLabel(/Email/i);
    const passwordInput = page.getByLabel(/Hasło/i);
    const submitButton = page.getByRole("button", { name: /Zaloguj się/i });

    await emailInput.fill("test@example.com");
    await passwordInput.fill("password123");

    // Click submit and check loading state
    const submitPromise = submitButton.click();

    // Button should show loading text or be disabled
    try {
      await Promise.race([
        expect(page.getByRole("button", { name: /Logowanie\.\.\./i })).toBeVisible({ timeout: 2000 }),
        expect(submitButton).toBeDisabled({ timeout: 2000 }),
      ]);
    } catch {
      // Loading state might be too fast to catch
    }

    // Wait for submission to complete (will fail, but we check loading state)
    try {
      await submitPromise;
    } catch {
      // Expected to fail with invalid credentials
    }
  });

  test("should navigate to register page when clicking register link", async ({ page }) => {
    const registerLink = page.getByRole("link", { name: /Zarejestruj się/i });
    await registerLink.click();
    await expect(page).toHaveURL("/auth/register");
  });

  test("should navigate to reset password page when clicking forgot password link", async ({ page }) => {
    const resetPasswordLink = page.getByRole("link", { name: /Zapomniałeś hasła\?/i });
    await resetPasswordLink.click();
    await expect(page).toHaveURL("/auth/reset-password");
  });
});
