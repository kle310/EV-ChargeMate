import { defineConfig } from "@playwright/test";

export default defineConfig({
  reporter: [["html"]], // Enables HTML report generation
  testDir: "./tests", // Directory where tests are located
  timeout: 30000, // Timeout for each test
  expect: {
    timeout: 5000, // Timeout for assertions
  },
  use: {
    baseURL: "http://localhost:3000", // Replace with your app's URL
    headless: true, // Run tests in headless mode
    screenshot: "on", // Capture screenshots on failure
    video: "retain-on-failure", // Record video on test failure
  },
  projects: [
    {
      name: "Chromium",
      use: { browserName: "chromium" },
    },
    {
      name: "Firefox",
      use: { browserName: "firefox" },
    },
    {
      name: "WebKit",
      use: { browserName: "webkit" },
    },
  ],
});
