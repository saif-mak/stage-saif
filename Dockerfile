FROM node:20-slim AS base

# Install openssl for Prisma
RUN apt-get update && apt-get install -y openssl libssl-dev && rm -rf /var/lib/apt/lists/*

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Run as root to avoid permission issues with npx/prisma in console
USER root

COPY --from=builder /app/public ./public
RUN mkdir .next
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Automatically run prisma generate at startup to ensure the client is ready
CMD ["sh", "-c", "npx prisma generate && node server.js"]
