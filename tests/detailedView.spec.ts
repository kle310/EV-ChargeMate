import { test, expect } from "@playwright/test";

test("test status view to detailed view", async ({ page }) => {
  // Navigate to the home page
  await page.goto("/");

  // Click on the status button for 'Free L3' and verify navigation
  const statusButton = page.getByRole("button", { name: "Free L3" });
  await statusButton.click();
  await expect(statusButton).toBeVisible(); // Verifying that the button is still visible

  // Click on the 'LADWP DS-' link and verify that it navigates to the right page
  const statusLink = page.getByRole("link", { name: "LADWP DS-" });
  await statusLink.click();
  await expect(page).toHaveURL(/.*12585A/); // Verifying URL changes

  // Click on the 'detailed' link and ensure it navigates to the correct page
  const detailedLink = page.locator('a[href="/12585A/detailed"]');
  await detailedLink.click();
  await expect(page).toHaveURL("/12585A/detailed"); // Ensure we navigated to the detailed page

  // Ensure that the 'Availability' heading is present and visible
  const availabilityHeading = page.getByRole("heading", {
    name: "Availability",
  });
  await expect(availabilityHeading).toBeVisible();
  await availabilityHeading.click();
});
