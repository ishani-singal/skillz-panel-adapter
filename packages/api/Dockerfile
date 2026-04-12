FROM node:20-slim AS builder
WORKDIR /app

COPY package.json ./
COPY packages/core/package.json ./packages/core/
COPY packages/api/package.json  ./packages/api/
COPY pnpm-workspace.yaml ./

RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY packages/core/src ./packages/core/src
COPY packages/core/tsconfig.json ./packages/core/
COPY packages/api/src  ./packages/api/src
COPY packages/api/tsconfig.json ./packages/api/

RUN pnpm --filter @skillz/panel-adapter-core build
RUN pnpm --filter @skillz/panel-adapter-api build

FROM node:20-slim
WORKDIR /app
COPY --from=builder /app/packages/api/dist ./dist
COPY --from=builder /app/packages/core/dist ./node_modules/@skillz/panel-adapter-core/dist
COPY --from=builder /app/packages/api/node_modules ./node_modules

EXPOSE 4000
CMD ["node", "dist/server.js"]
