# Security Policy

## Reporting a vulnerability

Please report security issues **privately**, not in a public GitHub issue.

- Use [GitHub Security Advisories](../../security/advisories/new) ("Report a vulnerability") if enabled
  on this repository, **or**
- Email the maintainer with details and reproduction steps.

We'll acknowledge your report, work on a fix, and credit you (if you'd like) once a patch is released.
Please give us reasonable time to address the issue before any public disclosure.

## Supported versions

This is an actively developed open-source project. Fixes are applied to the `main` branch. There is
no long-term-support guarantee for older tags.

## Deploying safely

If you self-host AuthentiGen, please:

- **Set a strong `JWT_SECRET`** (32+ random chars). In development one is auto-generated and written to
  `.env`; in production you must set it yourself. Never commit your real `.env` (it is gitignored).
- **Use HTTPS** in front of the app so session cookies are sent with `Secure` + `SameSite`.
- **Lock down the database** — the default `.env.example` credentials are for local development only.
- Restrict who can reach the admin panel.

## Known limitations (current hardening gaps)

These are documented intentionally so operators can make informed decisions. Contributions addressing
them are welcome (see the [Roadmap](README.md#roadmap)):

- **Rate limiting** is applied to the `/api/trpc` surface (configurable via `RATE_LIMIT_WINDOW_MS` /
  `RATE_LIMIT_MAX`). Set `TRUST_PROXY` when running behind a reverse proxy so client IPs are correct.
  The `/storage` route and batch download are intentionally exempt.
- **Single-instance design.** Jobs run in-process (with a global image concurrency cap) and are
  recovered on restart, but there is no distributed queue — horizontal scaling across multiple app
  instances needs additional work (e.g. Redis/BullMQ).
- **Local file storage** is public-by-URL (with a random suffix). For sensitive content, put it behind
  auth or move to signed object storage.
- **No email verification** on signup, and email notifications are currently a `console.log` stub.

## Note on intended use

AuthentiGen is a media-processing tool. See the [Intended use](README.md#intended-use) section of the
README for the responsible-use expectations that accompany this project.
