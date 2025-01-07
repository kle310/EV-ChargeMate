import { test, expect } from "@playwright/test";

test("test status update and navigation flow", async ({ page }) => {
  // Navigate to the home page and wait for it to load
  await page.goto("http://localhost:3000/12585B");

  // Wait for the link with the text "0" to be visible
  const statusLink = page.getByRole("link", { name: "0" });
  await expect(statusLink).toBeVisible();

  // Check if the status number is updated correctly
  const statusNumber = page.locator("#statusNumber");
  await expect(statusNumber).toContainText("0"); // Ensure the number is correctly displayed
});
