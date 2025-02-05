import { test, expect } from "@playwright/test";

// Fixture to set up common page navigation and footer check
test.beforeEach(async ({ page }) => {
  // Navigate to the homepage and wait for the page to load completely
  await page.goto("/");
});

test("homepage has title", async ({ page }) => {
  await expect(page).toHaveTitle("Home - EV ChargeMate");
});

test("can filter by city", async ({ page }) => {
  await expect(page.locator("#citySelector")).toBeVisible();
  await expect(page.locator("#citySelector")).toHaveValue("");
  await page.locator("#citySelector").click();
  await page.locator("#citySelector").selectOption("monterey_park");
  await expect(page.locator("body")).toContainText("Monterey Park");
  await expect(page.locator("body")).toContainText("$0.20/kWh");
  await expect(page.locator("body")).toContainText(
    "4100 Market Place Drive, Suite EV"
  );
});

test("can load city directly", async ({ page }) => {
  await page.goto("/?city=monterey_park");
  await expect(page.locator("body")).toContainText("Monterey Park");
  await expect(page.locator("body")).toContainText("$0.20/kWh");
  await expect(page.locator("body")).toContainText(
    "4100 Market Place Drive, Suite EV"
  );
  await expect(page.locator("#status-153420")).toContainText(
    /AVAILABLE|IN USE/,
    {
      timeout: 30000,
    }
  );
});
