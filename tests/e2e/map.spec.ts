import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/map");
});

test("map loads with markers", async ({ page }) => {
  // Verify map container and map are visible
  await expect(page.locator("#map")).toBeVisible();

  // Verify map control is visible
  await expect(page.locator("#stationCount")).toBeVisible();
});
