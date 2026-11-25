import { defineConfig, devices } from '@playwright/test';

/**
 * E2E tests run against the production build with an isolated key store and
 * fixed test-only secrets. WebGL uses SwiftShader (software) in CI, so these
 * tests check behaviour, not frame rate.
 */
const PORT = 3100;
export const E2E_ENV = {
  BIOLAB_SESSION_SECRET: 'e2e-only-session-secret-0123456789abcdefghij',
  BIOLAB_KEY_PEPPER: 'e2e-only-key-pepper-0123456789abcdefghijklmn',
  BIOLAB_KEYSTORE_PATH: '.data/e2e-keys.json',
  // the suite covers access keys and plans; open access is the production default
  BIOLAB_REQUIRE_KEY: '1',
};

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 120_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  globalSetup: './tests/e2e/global-setup.ts',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'off',
    launchOptions: { args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] },
  },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } }, testIgnore: /responsive\.spec\.ts/ },
    { name: 'mobile-chromium', use: { ...devices['Pixel 7'] }, testMatch: /responsive\.spec\.ts/ },
  ],
  webServer: {
    // Node on Windows only spawns .cmd shims by their full name
    command: `${process.platform === 'win32' ? 'npx.cmd' : 'npx'} next start -p ${PORT}`,
    port: PORT,
    reuseExistingServer: false,
    env: { ...E2E_ENV, NODE_ENV: 'production' },
    timeout: 120_000,
  },
});
