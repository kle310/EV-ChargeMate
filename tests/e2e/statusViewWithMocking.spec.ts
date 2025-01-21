import { test, expect, Page } from "@playwright/test";

const testStatus = async (
  page: Page,
  type: string,
  duration: number,
  expectedText: string,
  expectedColor: string
): Promise<void> => {
  await page.route("**/station/12585A/status", async (route) => {
    const json = {
      status_type: type,
      status_duration: duration,
    };
    await route.fulfill({ json });
  });

  await page.goto("/station/12585A/live");

  const backLink = page.getByRole("link", {
    name: "← Back to Station Details",
  });
  await expect(backLink).toBeVisible();

  const statusNumber = page.locator("#statusNumber");
  await expect(statusNumber).toContainText(expectedText);

  const statusBackground = page.locator(".status-box");
  await expect(statusBackground).toHaveAttribute(
    "style",
    `background-color: ${expectedColor};`
  );
};

test("can show unknown status", async ({ page }: { page: Page }) => {
  await page.goto("/station/12585B/live");

  const backLink = page.getByRole("link", {
    name: "← Back to Station Details",
  });
  await expect(backLink).toBeVisible();

  const statusNumber = page.locator("#statusNumber");
  await expect(statusNumber).toContainText("0");

  expect(page.getByText("Unknown Status")).toBeVisible();
  expect(page.getByText("0")).toBeVisible();

  const statusBackground = page.locator(".status-box");
  await expect(statusBackground).toHaveAttribute(
    "style",
    "background-color: rgb(245, 245, 245);"
  );
});

test("can show in use status", async ({ page }: { page: Page }) => {
  await testStatus(page, "Charging", 30, "30", "rgb(254, 232, 231)");
});

test("can show available status", async ({ page }: { page: Page }) => {
  await testStatus(page, "Available", 90, "90", "rgb(232, 245, 233)");
});
