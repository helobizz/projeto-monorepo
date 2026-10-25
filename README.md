# Projeto Monorepo FATEC

a9044b2771adb71433096bdf091d46f68f5bf88d

## Teste Skip ci

![Status do CI](https://github.com/i-davies/projeto-monorepo/actions/workflows/ci.yml/badge.svg)
@@ -31,18 +33,18 @@ pnpm sequelize-cli db:migrate

### Raiz do monorepo (`package.json`)

| Comando                 | Descrição                         |
| ----------------------- | --------------------------------- |
| `pnpm docker:build-api` | Builda a imagem Docker do backend |
| `pnpm docker:build-app` | Builda a imagem Docker do app     |
| `pnpm compose:up`       | Sobe os containers em background  |
| `pnpm compose:down`     | Derruba os containers             |
| `pnpm compose:logs`     | Acompanha os logs dos containers  |

### Backend (`backend/package.json`)

| Comando      | Descrição                                       |
| ------------ | ----------------------------------------------- |
| `pnpm dev`   | Sobe o servidor em modo desenvolvimento (watch) |
| `pnpm build` | Compila o TypeScript para `dist/`               |
| `pnpm start` | Roda o servidor já compilado (`dist/server.js`) |