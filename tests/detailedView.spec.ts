import { test, expect } from "@playwright/test";

test("test status view to detailed view", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Free L3" }).click();
  await page.getByRole("link", { name: "LADWP DS-" }).click();
  await page.locator('a[href="/12585A/detailed"]').click();
  await page.getByRole("heading", { name: "Availability" }).click();
});
