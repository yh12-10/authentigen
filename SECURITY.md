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
- **Set real Stripe keys and webhook secret** only on a trusted host, and verify the webhook endpoint.
- Restrict who can reach the admin panel; the `admin` role can grant credits.

## Known limitations (current hardening gaps)

These are documented intentionally so operators can make informed decisions. Contributions addressing
them are welcome (see the [Roadmap](README.md#roadmap)):

- **No rate limiting** on uploads or API calls — add a reverse-proxy or app-level limiter for public
  deployments.
- **Single-instance design.** Jobs run in-process with an in-memory per-user semaphore; there is no
  distributed queue, so horizontal scaling needs additional work.
- **Local file storage** is public-by-URL (with a random suffix). For sensitive content, put it behind
  auth or move to signed object storage.
- **No email verification** on signup, and email notifications are currently a `console.log` stub.

## Note on intended use

AuthentiGen is a media-processing tool. See the [Intended use](README.md#intended-use) section of the
README for the responsible-use expectations that accompany this project.
