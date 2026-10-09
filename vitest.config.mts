import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      include: ['src/domain/**', 'src/application/**'],
      // Ports and DTOs are type-only files with no runtime code.
      exclude: ['src/application/ports/**', 'src/application/dto/**', 'src/domain/entities/**'],
      reporter: ['text', 'text-summary'],
      thresholds: { lines: 90, functions: 90, branches: 90, statements: 90 },
    },
  },
});
