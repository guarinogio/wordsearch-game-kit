import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    projects: [
      {
        test: {
          name: 'node',
          environment: 'node',
          include: [
            'packages/**/*.test.ts',
            'apps/**/*.test.ts',
          ],
          exclude: [
            'packages/wordsearch-react/**/*.test.tsx',
            'apps/**/node_modules/**',
            'packages/**/node_modules/**',
          ],
        },
      },
      {
        test: {
          name: 'jsdom',
          environment: 'jsdom',
          include: [
            'packages/wordsearch-react/**/*.test.tsx',
            'packages/wordsearch-react/**/*.test.ts',
          ],
        },
      },
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: [
        'packages/**/*.ts',
        'packages/**/*.tsx',
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
