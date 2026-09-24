FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
COPY tsconfig*.json ./
COPY src ./src
COPY prisma7.config.ts ./

RUN npx prisma generate
RUN npm run build

RUN mkdir -p dist/generated && cp -r src/generated/* dist/generated/

FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma7.config.ts ./

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/app.js"]