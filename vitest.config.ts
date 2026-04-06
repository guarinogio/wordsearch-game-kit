import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,

    include: [
      'packages/**/*.test.ts',
      'packages/**/*.test.tsx',
      'apps/**/*.test.ts',
      'apps/**/*.test.tsx',
    ],

    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],

      include: [
        'packages/**/*.ts',
        'apps/**/*.ts',
        'apps/**/*.tsx',
      ],

      exclude: [
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/dist/**',
        '**/node_modules/**',
      ],
    },
  },
});
