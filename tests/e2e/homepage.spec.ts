import { test, expect } from "@playwright/test";

// Fixture to set up common page navigation and footer check
test.beforeEach(async ({ page }) => {
  // Navigate to the homepage and wait for the page to load completely
  await page.goto("/");
});

test("homepage has title", async ({ page }) => {
  // Assert that the page title is correct
  await expect(page).toHaveTitle("Home - EV ChargeMate");
});

test("homepage tab navigation", async ({ page }) => {
  // Click on the 'About' tab and ensure it navigates to the correct page
  await page.getByRole("button", { name: "About" }).click();
  await expect(
    page.getByRole("heading", { name: "About EV ChargeMate" })
  ).toBeVisible();
});
