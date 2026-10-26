# Estágio 1: Build da Aplicação

# 1° passo: Define a imagem de origem base (pega uma imagem crua e cria configs em cima dela)
FROM node:24-alpine AS builder

# Instalação do pnpm globalmente
RUN corepack enable && corepack prepare pnpm@latest --activate

# 2° Define o diretório de trabalho interno do container (vai ficar dentro do linux)
WORKDIR /app

# Copia dos manifestos de dependências do backend
COPY package.json pnpm-lock.yaml* ./

# Instalação de todas as dependências (incluindo devDependencies para o build)
RUN pnpm config set strict-dep-builds false && pnpm install --frozen-lockfile

# desativa a restrição do pnpm 11
RUN pnpm config set strict-dep-builds false

# Copia do código-fonte e da configuração do TypeScript
COPY tsconfig.json ./
COPY src ./src

# Compilação do TypeScript para Javascript (gera a pasta dist/)
RUN pnpm run build

# Remoção das dependências de desenvolvimento para diminuir o tamanho final
RUN pnpm prune --prod

# Estágio 2: Imagem Final de Execução (Produção)
FROM node:24-alpine AS runner

WORKDIR /app

# Definição do ambiente como produção

ENV NODE_ENV=production
ENV PORT=3000

# Instala o pnpm no estágio de execução
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copia os arquivos necessários do estágio de build
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Expõe a porta da aplicação
EXPOSE 3000

# Inicia a aplicação
CMD ["node", "dist/server.js"]
