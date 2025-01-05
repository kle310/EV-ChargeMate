import { test, expect } from "@playwright/test";

// Fixture to set up common page navigation and footer check
test.beforeEach(async ({ page }) => {
  // Navigate to the homepage and wait for the page to load completely
  await page.goto("/");

  // Ensure the footer is visible for all tests
  const footer = page.locator("footer");
  await expect(footer).toBeVisible();
});

test("homepage has title", async ({ page }) => {
  // Assert that the page title is correct
  await expect(page).toHaveTitle("ChargeMate - save money on charging");
});

test("homepage tab navigation", async ({ page }) => {
  // Click on the 'About' tab and ensure it navigates to the correct page
  await page.getByRole("button", { name: "About" }).click();
  await expect(
    page.getByRole("heading", { name: "Currently Seeking" })
  ).toBeVisible();

  await page.getByRole("button", { name: "Overview" }).click();
  await expect(page.locator("body")).toContainText("Overview");
});
