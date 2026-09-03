# syntax=docker/dockerfile:1

# ============ Etapa 1: dependencias ============
FROM node:22-slim AS deps
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

# ============ Etapa 2: fuente (CLIs: payload migrate / seed) ============
# Sin build ni seed: solo código + node_modules para ejecutar el CLI de Payload
# y tsx (seed). El job `migrate` de docker-compose usa este target.
FROM deps AS source
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

COPY . .

# Secretos que el init de Payload necesita al ejecutar CLIs (migrate/seed).
# DATABASE_URI no se fija en build-time: el job lo pasa en runtime.
ARG PAYLOAD_SECRET=dev-secret-atractiva-change-me
ARG NEXT_PUBLIC_BASE_URL=http://localhost:3000

ENV PAYLOAD_SECRET=$PAYLOAD_SECRET \
    NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL

# ============ Etapa 3: build ============
# El init de Payload conecta a Postgres durante `next build`; por eso el build
# usa la URL host (127.0.0.1:${POSTGRES_PORT}) y requiere `db` arriba y
# `network: host` (ver docker-compose.yml). El esquema NO se crea aquí: se
# aplica con migraciones antes del build (job `migrate`).
FROM source AS builder

ARG DATABASE_URI=postgres://atractiva:atractiva-pg@127.0.0.1:5433/atractiva
ARG PAYLOAD_SECRET=dev-secret-atractiva-change-me
ARG NEXT_PUBLIC_BASE_URL=http://localhost:3000

ENV DATABASE_URI=$DATABASE_URI \
    PAYLOAD_SECRET=$PAYLOAD_SECRET \
    NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL

RUN npm run build

# ============ Etapa 4: runtime (standalone) ============
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]
