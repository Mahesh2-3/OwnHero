# OwnHero

A private fitness workspace for planning training, recording completed sets, and following progress over time.

## Stack

- Next.js App Router and TypeScript
- Auth.js Google OAuth with database sessions
- PostgreSQL and Prisma ORM
- Server actions validate inputs and derive ownership from the authenticated session
- Groq keys encrypted server-side with AES-256-GCM

## Local setup

1. Install Node.js 24 and PostgreSQL.
2. Create a local `.env` with `DATABASE_URL`, `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, and `AI_ENCRYPTION_KEY`.
3. Generate a 32-byte encryption key, for example with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`. Keep this value in a secret manager; do not commit it or store it in the database.
4. Run `npm install`.
5. Run `npm run db:migrate` and `npm run db:generate`.
6. Run `npm run dev` and open `http://localhost:3000`.

Create Google OAuth credentials in Google Cloud Console and add `http://localhost:3000/api/auth/callback/google` as an authorized redirect URI. Production should use the corresponding HTTPS callback URL.

## Current implementation

Implemented: Google sign-in/session wiring, user-owned schema, profile preferences and measurements, multiple weekly workout plans, day scheduling/rest days, exercise editing/duplication/reordering, actual set logging with target/actual separation, pause/resume, unplanned exercises, session notes, history editing, scheduled-day streaks, actual-data progress charts and milestones, encrypted Groq key storage and validation, daily AI reports and user-managed memories, dark/light/system theme, JSON export, and account deletion.

The Google OAuth callback and database operations require the environment values above. No credentials or database were supplied, so sign-in and persistent data cannot be exercised until configured.

## Security notes

- User-specific mutations use the session user ID and confirm resource ownership server-side.
- Groq secrets are encrypted at rest and never returned to the browser. Set a strong 32-byte `AI_ENCRYPTION_KEY` before saving any user key; rotating this key requires re-encrypting existing provider records.
- Export requires a signed-in session and is marked private/no-store.
- Do not use production data without enabling managed PostgreSQL backups, HTTPS, and deployment secrets.

## Deployment

The project is prepared for Vercel's Next.js preset and Node.js 24. Import the GitHub repository with the repository root as the project root. Use `npm ci` to install dependencies and `npm run build` as the build command; Next.js selects its own output directory.

Set these values in the host's **production** environment settings. Keep them out of Git and do not prefix them with `NEXT_PUBLIC_`.

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Managed PostgreSQL connection string used by Prisma |
| `AUTH_SECRET` | Random Auth.js secret of at least 32 characters |
| `AUTH_GOOGLE_ID` | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret |
| `AI_ENCRYPTION_KEY` | 32-byte hex key used to encrypt saved Groq keys |
| `GROQ_MODEL` | Optional model override; defaults to `llama-3.3-70b-versatile` |

Generate the local encryption key with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`. Use a secret manager for production. Rotating this key requires re-encrypting stored provider keys.

Before the first production deployment, configure the production database and run `npm run db:deploy` from a trusted release runner with its production `DATABASE_URL`. Run it again for each new migration before deploying code that depends on the changed schema. The command applies checked-in migrations; it does not create migrations from schema changes.

In Google Cloud Console, add `https://<your-production-domain>/api/auth/callback/google` as an authorized redirect URI. Google also allows the localhost callback for development. Set production secrets only for the Production environment; add separate staging credentials and a separate database if Preview deployments need sign-in or data access.

Vercel automatically selects the Next.js build settings and currently defaults new projects to Node.js 24. Auth.js detects Vercel as a trusted host. For another reverse-proxy host, follow Auth.js deployment guidance for `AUTH_TRUST_HOST`.

## Progressive web app

OwnHero can be installed from a supported browser using the browser's **Install app** or **Add to Home Screen** option. The service worker caches versioned static assets and a simple offline page; it deliberately does not cache dashboard pages, workouts, API responses, or account data. Logging workouts still requires a network connection.
