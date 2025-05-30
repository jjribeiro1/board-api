FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm exec prisma generate
RUN pnpm build

RUN pnpm prune --prod

FROM node:22-alpine AS final

WORKDIR /app

COPY --from=builder /app/dist/src ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3001

CMD [ "node", "dist/src/main.js" ]