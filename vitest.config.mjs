import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Two test "projects" in one config:
// - node:  helper unit tests and Supertest API tests (no browser needed)
// - react: component tests, which need a fake browser DOM (jsdom)
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    projects: [
      {
        extends: true,
        test: {
          name: 'node',
          environment: 'node',
          include: ['utils/**/*.test.js', 'tests/**/*.test.js'],
        },
      },
      {
        extends: true,
        test: {
          name: 'react',
          environment: 'jsdom',
          include: ['src/**/*.test.jsx'],
          setupFiles: ['./vitest.setup.js'],
        },
      },
    ],
  },
});
