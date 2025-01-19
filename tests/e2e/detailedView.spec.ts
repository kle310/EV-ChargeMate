import { test, expect, Page } from "@playwright/test";

// Mock data helper
const mockChargingData = (page: Page, data: any) => {
  return page.route("**/api/12585A/status", (route) => {
    route.fulfill({ json: data });
  });
};

test.describe("Detailed View Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the detailed view page
    await page.goto("/12585A/detailed");
  });

  test("displays usage statistics correctly", async ({ page }) => {
    // Mock a week of charging data
    const mockData = {
      status: Array(7).fill(null).map((_, i) => ({
        timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        plug_status: "Charging",
        duration: 120 // 2 hours in minutes
      }))
    };

    await mockChargingData(page, mockData);

    // Check if usage stats are displayed
    await expect(page.locator(".usage-stats")).toBeVisible();
    
    // Verify day bars are present
    const dayBars = page.locator(".day-bar");
    await expect(dayBars).toHaveCount(7);

    // Check activity level (should be "low" since sessions < 70)
    const bar = page.locator(".bar.low");
    await expect(bar).toBeVisible();
  });

  test("calculates activity levels correctly", async ({ page }) => {
    // Mock data with 100 charging sessions (should be "moderate")
    const mockData = {
      status: Array(100).fill(null).map((_, i) => ({
        timestamp: new Date(Date.now() - i * 2 * 60 * 60 * 1000).toISOString(),
        plug_status: "Charging",
        duration: 60
      }))
    };

    await mockChargingData(page, mockData);

    // Check for moderate activity level
    const bar = page.locator(".bar.moderate");
    await expect(bar).toBeVisible();
  });

  test("handles empty charging data", async ({ page }) => {
    await mockChargingData(page, { status: [] });

    // Check if empty state is handled gracefully
    await expect(page.locator(".usage-stats")).toBeVisible();
    await expect(page.locator(".day-bar")).toHaveCount(7); // Should still show all days
    
    // All bars should have 0% width
    const bars = page.locator(".bar");
    for (const bar of await bars.all()) {
      await expect(bar).toHaveAttribute("style", "width: 0%");
    }
  });

  test("displays correct time format", async ({ page }) => {
    // Mock data with specific duration
    const mockData = {
      status: [{
        timestamp: new Date().toISOString(),
        plug_status: "Charging",
        duration: 90 // 1.5 hours
      }]
    };

    await mockChargingData(page, mockData);

    // Check if time is formatted correctly (should show 1.5)
    const dayBar = page.locator(".day-bar").first();
    await expect(dayBar).toContainText("1.5");
  });
});
