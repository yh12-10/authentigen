# Contributing to AuthentiGen

Thanks for your interest in improving AuthentiGen! This guide covers local setup and the
conventions the project follows.

## Prerequisites

- **Node 20+** and **pnpm** (`corepack enable` will provide pnpm)
- **MySQL 8** running locally — or just use Docker (`docker compose up`), which provides it

## Setup

```bash
pnpm install
cp .env.example .env     # edit DATABASE_URL if not using Docker
pnpm db:push             # create/update tables
pnpm dev                 # http://localhost:3000
```

See [README.md](README.md#quick-start) for the full quick start and [ARCHITECTURE.md](ARCHITECTURE.md)
for how the pieces fit together.

## Scripts

| Command        | What it does                                                        |
| -------------- | ------------------------------------------------------------------- |
| `pnpm dev`     | Run the dev server (Express + Vite middleware, hot reload)          |
| `pnpm build`   | Production build (client → `dist/public`, server → `dist/index.js`) |
| `pnpm start`   | Run the production build                                            |
| `pnpm check`   | TypeScript type-check (`tsc --noEmit`) — must pass with 0 errors    |
| `pnpm test`    | Run the Vitest suite                                                |
| `pnpm format`  | Format the codebase with Prettier                                   |
| `pnpm db:push` | Generate + apply Drizzle migrations                                 |

## Before opening a PR

1. `pnpm check` passes (no TypeScript errors).
2. `pnpm test` passes. Add or update tests for behavior you change — the job lifecycle and the
   humanization pipeline are the most valuable to cover.
3. `pnpm format` (or `prettier --check .`) leaves the tree clean.
4. If you changed the API surface, the front end still builds (`pnpm build`).

## Pull request conventions

- Branch off `main`; keep PRs focused on a single concern.
- Write a clear description of **what** changed and **why**. Link any related issue.
- Update docs (`README.md` / `ARCHITECTURE.md`) when you change behavior, config, or the data model.

## Code style

- TypeScript everywhere; the project is `strict`. Avoid `any` — prefer precise types.
- Formatting is handled by Prettier (`.prettierrc`); don't hand-format.
- Add new API endpoints as tRPC procedures in `server/routers.ts` so types flow to the client.
- Keep the humanization pipeline **deterministic** — output should be reproducible from input +
  intensity alone.

## Good first contributions

The [Roadmap](README.md#roadmap) lists larger items (S3 storage, rate limiting, email, a job queue,
front-end tests). Smaller wins: improving test coverage, accessibility passes, docs, and removing dead
code are all welcome.

## Reporting security issues

Please do **not** open a public issue for vulnerabilities — see [SECURITY.md](SECURITY.md).
