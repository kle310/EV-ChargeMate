import { test, expect } from "@playwright/test";

test("test status update and navigation flow", async ({ page }) => {
  // Navigate to the status page
  await page.goto("/12585B");

  // Wait for the link with the text "0" to be visible
  const statusLink = page.getByRole("link", { name: "0" });
  await expect(statusLink).toBeVisible();

  // Check if the status number is updated correctly
  const statusNumber = page.locator("#statusNumber");
  await expect(statusNumber).toContainText("0");

  // Check if the background color is grey for unknown status
  const statusBackground = page.locator("body");
  await expect(statusBackground).toHaveAttribute(
    "background-color: grey;"
  );

  // Verify navigation to detailed view works
  await statusLink.click();
  await expect(page).toHaveURL("/12585B/detailed");
});
