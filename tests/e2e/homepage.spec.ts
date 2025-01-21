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

test("can filter by city", async ({ page }) => {
  // Assert that the page title is correct
  await page.locator("#citySelector").selectOption("monterey_park");
  await expect(page.locator("body")).toContainText("Monterey Park");
  await expect(page.locator("body")).toContainText("$0.20/kWh");
  await expect(page.locator("body")).toContainText(
    "4100 Market Place Drive, Suite EV"
  );
});
