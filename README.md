# Hero Workout

A private fitness workspace for planning training, recording completed sets, and following progress over time.

## Stack

- Next.js App Router and TypeScript
- Auth.js Google OAuth with database sessions
- PostgreSQL and Prisma ORM
- Server actions validate inputs and derive ownership from the authenticated session
- Groq keys encrypted server-side with AES-256-GCM

## Local setup

1. Install Node.js 24 and PostgreSQL.
2. Copy `.env.example` to `.env` and set `DATABASE_URL`, `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, and `AI_ENCRYPTION_KEY`.
3. Generate a 32-byte encryption key, for example with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`. Keep this value in a secret manager; do not commit it or store it in the database.
4. Run `npm install`.
5. Run `npm run db:migrate -- --name init` and `npm run db:generate`.
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

Deploy the Next.js app to Vercel or another Node-compatible host. Configure a managed PostgreSQL `DATABASE_URL`, Google OAuth credentials, `AUTH_SECRET`, and the encryption key in the host's secret settings. Apply migrations with `npx prisma migrate deploy` as a release step.
