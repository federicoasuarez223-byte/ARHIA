FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

# ── Development ──────────────────────────────────────────────────────────────
FROM base AS development
COPY package*.json ./
COPY ../../packages/shared/package*.json /packages/shared/
RUN npm install
COPY . .
EXPOSE 3001
CMD ["npm", "run", "dev"]

# ── Builder ──────────────────────────────────────────────────────────────────
FROM base AS builder
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# ── Production ───────────────────────────────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app
RUN apk add --no-cache libc6-compat

ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 apiuser
USER apiuser

EXPOSE 3001
CMD ["node", "dist/server.js"]
