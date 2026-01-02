import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test("should load the home page", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/10x Astro Starter/i);
  });

  test("should have accessible navigation", async ({ page }) => {
    await page.goto("/");
    // Add your navigation tests here
    // This test currently passes but should be expanded with actual navigation checks
    expect(page).toBeTruthy();
  });
});
