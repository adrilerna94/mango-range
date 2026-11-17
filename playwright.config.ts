import { defineConfig, devices } from "@playwright/test";

const isCI = !!process.env.CI;
const MOBILE_SPECS = /.*\.mobile\.spec\.ts/;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  reporter: isCI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: "http://localhost:8080",
    trace: "on-first-retry",
  },
  webServer: {
    // En CI se prueba el build de producción (el workflow ejecuta `npm run build` antes).
    command: isCI ? "npm run start" : "npm run dev",
    url: "http://localhost:8080",
    reuseExistingServer: !isCI,
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: MOBILE_SPECS,
    },
    {
      // Los tests táctiles usan CDP, así que el dispositivo debe ser Chromium.
      name: "mobile",
      use: { ...devices["Pixel 7"] },
      testMatch: MOBILE_SPECS,
    },
  ],
});
