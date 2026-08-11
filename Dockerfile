# syntax=docker/dockerfile:1

# ============ Etapa 1: dependencias ============
FROM node:20-slim AS deps
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

# ============ Etapa 2: build + seed ============
FROM node:20-slim AS builder
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables necesarias en build-time (Next + Payload)
ARG DATABASE_URI=file:/app/payload.db
ARG PAYLOAD_SECRET=dev-secret-atractiva-change-me
ARG SEED_ADMIN_EMAIL=admin@atractivacl.cl
ARG SEED_ADMIN_PASSWORD=atractiva-admin
ARG NEXT_PUBLIC_BASE_URL=http://localhost:3000

ENV DATABASE_URI=$DATABASE_URI \
    PAYLOAD_SECRET=$PAYLOAD_SECRET \
    SEED_ADMIN_EMAIL=$SEED_ADMIN_EMAIL \
    SEED_ADMIN_PASSWORD=$SEED_ADMIN_PASSWORD \
    NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL

# Copiamos las imágenes originales a un dir de seed antes del build
RUN mkdir -p /seed-media && cp media/*.png /seed-media/ 2>/dev/null || true

RUN npm run build

# Genera una DB limpia con admin + 2 productos (con imágenes)
RUN SEED_MEDIA_DIR=/seed-media npm run seed

# ============ Etapa 3: runtime (standalone) ============
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000 \
    DATABASE_URI=file:/app/data/payload.db

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Baseline inicial: se copian al primer arranque si los volúmenes están vacíos
COPY --from=builder /app/payload.db /seed/payload.db
COPY --from=builder /app/media /seed/media

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["node", "server.js"]