import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true, // habilita as variaveis globais do js
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      // Define o provedor nativo V8 (o mesmo do node)
      provider: 'v8',

      // Diretório onde os relatórios HTML e LCOV serão salvos
      reportsDirectory: './coverage',

      // Padrões de arquivos incluídos na análise de cobertura
      include: ['src/**/*.ts'], // qualquer coisa e qualquer coisa que seja ts

      // arquivos e pastas que devem ser desconsiderados
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.spec.ts',
        'src/types/**',
        'scr/server.ts',
        'src/migrations/**',
      ],

      // Definição de limites mínimos obrigatórios (Quality Gate Local)
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80
      }
    }
  },
});
