import { test, expect, Page } from "@playwright/test";

const testStatus = async (
  page: Page,
  status: number,
  expectedText: string,
  expectedColor: string
): Promise<void> => {
  await page.route("**/api/12585A/status", async (route) => {
    const json = { status: status };
    await route.fulfill({ json });
  });

  await page.goto("/12585A");

  const statusLink = page.getByRole("link", { name: expectedText });
  await expect(statusLink).toBeVisible();

  const statusNumber = page.locator("#statusNumber");
  await expect(statusNumber).toContainText(expectedText);

  const statusBackground = page.locator("body");
  await expect(statusBackground).toHaveAttribute(
    "style",
    `background-color: ${expectedColor};`
  );
};

test("test status is unknown", async ({ page }: { page: Page }) => {
  await page.goto("/12585B");

  const statusLink = page.getByRole("link", { name: "0" });
  await expect(statusLink).toBeVisible();

  const statusNumber = page.locator("#statusNumber");
  await expect(statusNumber).toContainText("0");

  const statusBackground = page.locator("body");
  await expect(statusBackground).toHaveAttribute(
    "style",
    "background-color: grey;"
  );
});

test("test status is charging", async ({ page }: { page: Page }) => {
  await testStatus(page, -30, "30", "red");
});

test("test status is available", async ({ page }: { page: Page }) => {
  await testStatus(page, 30, "30", "green");
});
