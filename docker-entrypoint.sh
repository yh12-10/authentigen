#!/bin/sh
set -e

# AuthentiGen container entrypoint:
#   1. Ensure a stable JWT secret (generated + persisted in the storage volume,
#      so we never ship a shared hardcoded secret and it survives restarts).
#   2. Apply database migrations.
#   3. Start the server.

if [ -z "$JWT_SECRET" ] || [ "${#JWT_SECRET}" -lt 32 ]; then
  SECRET_FILE="/app/storage/.jwt_secret"
  mkdir -p /app/storage
  if [ ! -f "$SECRET_FILE" ]; then
    node -e "console.log(require('crypto').randomBytes(48).toString('hex'))" > "$SECRET_FILE"
    echo "[entrypoint] Generated a new JWT_SECRET (persisted in the storage volume)."
  fi
  JWT_SECRET="$(cat "$SECRET_FILE")"
  export JWT_SECRET
fi

echo "[entrypoint] Applying database migrations..."
# MySQL's first-boot init can leave the server briefly unreachable even after the
# healthcheck passes, so retry rather than crash-restarting the container.
attempt=0
until pnpm exec drizzle-kit migrate; do
  attempt=$((attempt + 1))
  if [ "$attempt" -ge 30 ]; then
    echo "[entrypoint] Migrations failed after $attempt attempts; giving up." >&2
    exit 1
  fi
  echo "[entrypoint] Database not ready (attempt $attempt) — retrying in 2s..."
  sleep 2
done

echo "[entrypoint] Starting AuthentiGen..."
exec node dist/index.js
