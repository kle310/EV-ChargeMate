import { test, expect } from "@playwright/test";

test("test status view to detailed view", async ({ page }) => {
  // Navigate to the home page
  await page.goto("/");

  await page.locator("#locationDropdown").selectOption("/12585B");
  await page.goto("http://localhost:3000/12585A");

  // Click on the 'detailed' link and ensure it navigates to the correct page
  await page.locator('a[href="/12585A/detailed"]').click();
  await expect(page).toHaveURL("/12585A/detailed"); // Ensure we navigated to the detailed page

  // Ensure that the 'Availability' heading is present and visible
  const availabilityHeading = page.getByRole("heading", {
    name: "Availability",
  });
  await expect(availabilityHeading).toBeVisible();
  await availabilityHeading.click();
});
