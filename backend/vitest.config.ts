import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true, // habilita as variaveis globais do js
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    exclude: ['node_modules', 'dist'],
  },
});
