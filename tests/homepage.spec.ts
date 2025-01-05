import { test, expect } from "@playwright/test";

// Fixture to set up common page navigation and footer check
test.beforeEach(async ({ page }) => {
  // Navigate to the homepage and wait for the page to load completely
  await page.goto("/", { waitUntil: "load" });

  // Ensure the footer is visible for all tests
  const footer = page.locator("footer");
  await expect(footer).toBeVisible();
});

test("homepage has title", async ({ page }) => {
  // Assert that the page title is correct
  await expect(page).toHaveTitle("Free SoCal Fast Chargers");
});

test("homepage tab navigation", async ({ page }) => {
  await page.getByRole("button", { name: "Free L3" }).click();
  await expect(page.getByRole("link", { name: "LADWP DS-" })).toBeVisible();

  await page.getByRole("button", { name: "Free L2" }).click();
  await expect(page.getByText("Cloverfield Blvd 1 2")).toBeVisible();

  await page.getByRole("button", { name: "Discounted" }).click();
  await expect(page.getByText("4100 Market Place Drive,")).toBeVisible();

  await page.getByRole("button", { name: "About" }).click();
  await expect(
    page.getByRole("heading", { name: "Currently Seeking" })
  ).toBeVisible();

  await page.getByRole("button", { name: "Overview" }).click();
  await expect(page).toHaveTitle("Free SoCal Fast Chargers");
});
