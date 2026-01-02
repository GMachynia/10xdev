import { test, expect } from "@playwright/test";

test.describe("Flashcards Management", () => {
  const testEmail = "test@test.com";
  const testPassword = "121212";

  test.beforeEach(async ({ page }) => {
    // Login with test user
    await page.goto("/auth/login");
    await page.waitForSelector("form", { timeout: 10000 });
    await page.getByLabel(/Email/i).fill(testEmail);
    await page.getByLabel(/Hasło/i).fill(testPassword);
    await page.getByRole("button", { name: /Zaloguj się/i }).click();

    // Wait for redirect to study page
    await page.waitForURL("/study", { timeout: 10000 });
    await page.waitForLoadState("networkidle");
  });

  test.describe("Create Flashcard Page", () => {
    test("should display create flashcard form with all required elements", async ({ page }) => {
      await page.goto("/create");

      // Check page title
      await expect(page).toHaveTitle(/Utwórz Fiszkę/i);
      await expect(page.getByRole("heading", { name: /Utwórz Fiszkę/i })).toBeVisible();

      // Check form elements
      const sourceTextInput = page.getByLabel(/Tekst źródłowy/i);
      await expect(sourceTextInput).toBeVisible();
      await expect(sourceTextInput).toHaveAttribute("maxlength", "200");
      await expect(sourceTextInput).toHaveAttribute("placeholder", /Wprowadź tekst źródłowy\.\.\./i);

      const translationTextarea = page.getByLabel(/Translacja/i);
      await expect(translationTextarea).toBeVisible();
      await expect(translationTextarea).toHaveAttribute("placeholder", /Wprowadź translację/i);

      // Check buttons
      const cancelButton = page.getByRole("button", { name: /Anuluj/i });
      await expect(cancelButton).toBeVisible();
      await expect(cancelButton).toBeEnabled();

      const submitButton = page.getByRole("button", { name: /Utwórz fiszkę/i });
      await expect(submitButton).toBeVisible();
      // Submit button should be disabled when form is empty
      await expect(submitButton).toBeDisabled();
    });

    test("should show character counter for source text", async ({ page }) => {
      await page.goto("/create");

      const sourceTextInput = page.getByLabel(/Tekst źródłowy/i);
      await sourceTextInput.fill("Test text");

      // Check character counter is visible
      await expect(page.getByText(/0\/200/i)).toBeVisible();
    });

    test("should validate source text length and show error", async ({ page }) => {
      await page.goto("/create");

      const sourceTextInput = page.getByLabel(/Tekst źródłowy/i);
      const longText = "a".repeat(201); // Exceeds max length

      await sourceTextInput.fill(longText);

      // Check validation error appears
      await expect(page.getByText(/Tekst źródłowy przekracza maksymalną długość 200 znaków/i)).toBeVisible();

      // Submit button should be disabled
      const submitButton = page.getByRole("button", { name: /Utwórz fiszkę/i });
      await expect(submitButton).toBeDisabled();
    });

    test("should show error when source text is empty", async ({ page }) => {
      await page.goto("/create");

      const sourceTextInput = page.getByLabel(/Tekst źródłowy/i);

      // Fill and clear to trigger empty validation
      await sourceTextInput.fill("Test");
      await sourceTextInput.clear();
      await sourceTextInput.blur();

      // Check validation error appears
      await expect(page.getByText(/Tekst źródłowy nie może być pusty/i)).toBeVisible();
    });

    test("should successfully create flashcard and redirect to study page", async ({ page }) => {
      await page.goto("/create");

      const sourceTextInput = page.getByLabel(/Tekst źródłowy/i);
      const translationTextarea = page.getByLabel(/Translacja/i);
      const submitButton = page.getByRole("button", { name: /Utwórz fiszkę/i });

      // Fill form
      await sourceTextInput.fill("Hello");
      await translationTextarea.fill("Cześć");

      // Submit button should be enabled
      await expect(submitButton).toBeEnabled();

      // Submit form
      await submitButton.click();

      // Wait for redirect to study page
      await page.waitForURL("/study", { timeout: 10000 });
      await expect(page).toHaveURL("/study");
    });

    test("should allow creating flashcard without translation", async ({ page }) => {
      await page.goto("/create");

      const sourceTextInput = page.getByLabel(/Tekst źródłowy/i);
      const submitButton = page.getByRole("button", { name: /Utwórz fiszkę/i });

      // Fill only source text
      await sourceTextInput.fill("Test without translation");

      // Submit form
      await submitButton.click();

      // Wait for redirect to study page
      await page.waitForURL("/study", { timeout: 10000 });
      await expect(page).toHaveURL("/study");
    });

    test("should cancel and redirect to study page", async ({ page }) => {
      await page.goto("/create");

      const cancelButton = page.getByRole("button", { name: /Anuluj/i });
      await cancelButton.click();

      // Should redirect to study page
      await expect(page).toHaveURL("/study");
    });

    test("should disable form during submission", async ({ page }) => {
      await page.goto("/create");

      const sourceTextInput = page.getByLabel(/Tekst źródłowy/i);
      const translationTextarea = page.getByLabel(/Translacja/i);
      const submitButton = page.getByRole("button", { name: /Utwórz fiszkę/i });

      await sourceTextInput.fill("Test");
      await translationTextarea.fill("Test translation");

      // Click submit
      const submitPromise = submitButton.click();

      // Check loading state
      await expect(page.getByRole("button", { name: /Tworzenie\.\.\./i })).toBeVisible({ timeout: 1000 });

      // Wait for submission
      await submitPromise;
    });
  });

  test.describe("Study Page - Display Flashcards", () => {
    test("should display empty state when no flashcards exist", async ({ page }) => {
      await page.goto("/study");

      // Check page title
      await expect(page).toHaveTitle(/Przeglądanie i Powtórki Fiszek/i);
      await expect(page.getByRole("heading", { name: /Przeglądanie i Powtórki Fiszek/i })).toBeVisible();

      // Check empty state is displayed
      await expect(page.getByText(/Nie masz jeszcze fiszek/i)).toBeVisible();
    });

    test("should display flashcards after creating them", async ({ page }) => {
      // Create a flashcard
      await page.goto("/create");
      await page.waitForSelector("form", { timeout: 10000 });
      await page.getByLabel(/Tekst źródłowy/i).fill("Test flashcard");
      await page.getByLabel(/Translacja/i).fill("Testowa fiszka");
      await page.getByRole("button", { name: /Utwórz fiszkę/i }).click();

      // Wait for redirect to study page
      await page.waitForURL("/study", { timeout: 10000 });
      await page.waitForLoadState("networkidle");

      // Wait for flashcard to be loaded - check for the paragraph element containing the text
      await page.waitForSelector('p:has-text("Test flashcard")', { timeout: 10000 });

      // Verify flashcard text is displayed
      await expect(page.locator("p").filter({ hasText: "Test flashcard" })).toBeVisible({ timeout: 5000 });
    });

    test("should display flashcard source text on front side", async ({ page }) => {
      // Create a flashcard
      await page.goto("/create");
      await page.getByLabel(/Tekst źródłowy/i).fill("Front text");
      await page.getByLabel(/Translacja/i).fill("Back text");
      await page.getByRole("button", { name: /Utwórz fiszkę/i }).click();

      await page.waitForURL("/study", { timeout: 10000 });

      // Check front side is displayed
      await expect(page.getByText("Front text")).toBeVisible();
    });

    test("should flip flashcard to show translation on back side", async ({ page }) => {
      // Create a flashcard
      await page.goto("/create");
      await page.getByLabel(/Tekst źródłowy/i).fill("Hello");
      await page.getByLabel(/Translacja/i).fill("Cześć");
      await page.getByRole("button", { name: /Utwórz fiszkę/i }).click();

      await page.waitForURL("/study", { timeout: 10000 });

      // Find the flashcard card element and click to flip
      // The card has role="button" and contains the flashcard text
      const flashcardCard = page.locator('[role="button"]').filter({ hasText: "Hello" }).first();

      // Click to flip
      await flashcardCard.click();

      // Wait for flip animation and check back side is visible
      await expect(page.getByText("Cześć")).toBeVisible({ timeout: 2000 });
    });

    test("should navigate to next flashcard", async ({ page }) => {
      // Create multiple flashcards
      const flashcards = [
        { source: "First card", translation: "Pierwsza karta" },
        { source: "Second card", translation: "Druga karta" },
        { source: "Third card", translation: "Trzecia karta" },
      ];

      for (const flashcard of flashcards) {
        await page.goto("/create");
        await page.getByLabel(/Tekst źródłowy/i).fill(flashcard.source);
        await page.getByLabel(/Translacja/i).fill(flashcard.translation);
        await page.getByRole("button", { name: /Utwórz fiszkę/i }).click();
        await page.waitForURL("/study", { timeout: 10000 });
      }

      // Check first card is displayed
      await expect(page.getByText("First card")).toBeVisible();

      // Find and click next button
      const nextButton = page.getByRole("button", { name: /Następna fiszka/i });
      await nextButton.click();

      // Check second card is displayed
      await expect(page.getByText("Second card")).toBeVisible({ timeout: 2000 });
    });

    test("should navigate to previous flashcard", async ({ page }) => {
      // Create multiple flashcards
      const flashcards = [
        { source: "Card 1", translation: "Karta 1" },
        { source: "Card 2", translation: "Karta 2" },
      ];

      for (const flashcard of flashcards) {
        await page.goto("/create");
        await page.getByLabel(/Tekst źródłowy/i).fill(flashcard.source);
        await page.getByLabel(/Translacja/i).fill(flashcard.translation);
        await page.getByRole("button", { name: /Utwórz fiszkę/i }).click();
        await page.waitForURL("/study", { timeout: 10000 });
      }

      // Navigate to second card
      const nextButton = page.getByRole("button", { name: /Następna fiszka/i });
      await nextButton.click();
      await expect(page.getByText("Card 2")).toBeVisible({ timeout: 2000 });

      // Navigate back to first card
      const previousButton = page.getByRole("button", { name: /Poprzednia fiszka/i });
      await previousButton.click();

      // Check first card is displayed
      await expect(page.getByText("Card 1")).toBeVisible({ timeout: 2000 });
    });

    test("should display flashcard statistics", async ({ page }) => {
      // Create flashcards
      const count = 3;
      for (let i = 0; i < count; i++) {
        await page.goto("/create");
        await page.getByLabel(/Tekst źródłowy/i).fill(`Card ${i + 1}`);
        await page.getByLabel(/Translacja/i).fill(`Karta ${i + 1}`);
        await page.getByRole("button", { name: /Utwórz fiszkę/i }).click();
        await page.waitForURL("/study", { timeout: 10000 });
      }

      // Check statistics are displayed
      await expect(page.getByText(new RegExp(`Liczba fiszek: ${count}`, "i"))).toBeVisible();
    });

    test("should navigate to create page from study page", async ({ page }) => {
      await page.goto("/study");

      // Find create flashcard button
      const createButton = page.getByRole("button", { name: /Dodaj fiszkę/i });

      await createButton.click();

      // Should navigate to create page
      await expect(page).toHaveURL("/create");
    });
  });
});
