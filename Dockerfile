FROM node:22-alpine

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY prisma ./prisma

RUN pnpm exec prisma generate

COPY . .

EXPOSE 3001

CMD [ "pnpm", "start" ]