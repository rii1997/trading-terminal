import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node', // Use node for API tests
    include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    testTimeout: 30000, // 30s timeout for API calls
  },
});
