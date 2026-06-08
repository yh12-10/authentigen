# syntax=docker/dockerfile:1

# Use a glibc-based image (not alpine) so sharp + ffmpeg-static prebuilt
# binaries work without extra musl shims.
FROM node:22-bookworm-slim AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /app

# ---- build stage: install all deps and produce dist/ ----
FROM base AS build
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# ---- runtime stage ----
FROM base AS runtime
ENV NODE_ENV=production
ENV PORT=3000

# ca-certificates for outbound TLS (e.g. Stripe API)
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Full node_modules is reused (it still contains drizzle-kit, needed to apply
# migrations on startup). Image size is not optimized for this reason.
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/drizzle ./drizzle
COPY --from=build /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=build /app/package.json ./package.json
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]
