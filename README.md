# Mini Golf Score Tracker

Next.js app for tracking two-player mini golf rounds, course history, personal bests, aces, and hole-by-hole scorecards.

## Stack

- Next.js
- React
- TypeScript
- Prisma
- PostgreSQL

## Admin Access

The app supports a single admin login. Set these environment variables both locally and in Vercel:

```env
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="replace-with-a-strong-password"
SESSION_SECRET="replace-with-a-long-random-secret"
```

Only the admin account can add, edit, or delete rounds.

## Local Setup

1. Install dependencies:

   ```powershell
   npm install
   ```

2. Create a Postgres database and copy your connection string into `.env`:

   ```env
   POSTGRES_PRISMA_URL="postgresql://USER:PASSWORD@HOST:5432/mini_golf_score_tracker?schema=public"
   POSTGRES_URL_NON_POOLING="postgresql://USER:PASSWORD@HOST:5432/mini_golf_score_tracker?schema=public"
   ADMIN_USERNAME="admin"
   ADMIN_PASSWORD="replace-with-a-strong-password"
   SESSION_SECRET="replace-with-a-long-random-secret"
   ```

3. Apply the schema:

   ```powershell
   npm run db:migrate
   ```

4. For a brand-new empty app, seed course/player data:

   ```powershell
   npm run db:seed
   ```

5. If you want to bring over the existing SQLite data instead, do not seed first. Place the backup file at `prisma/backups/sqlite-export.json` and run:

   ```powershell
   npm run db:import-backup
   ```

6. Start the app:

   ```powershell
   npm run dev
   ```

## Deploying To Vercel

1. Create a hosted PostgreSQL database.
2. Add the Postgres environment variables to your Vercel project.
3. Import this GitHub repo into Vercel.
4. Deploy.

The build script runs:

```powershell
prisma generate
prisma migrate deploy
next build
```

That means Vercel will apply any committed Prisma migrations during deployment before building the app.

## Migrating Existing SQLite Data

Before the switch to Postgres, a backup was exported to:

`prisma/backups/sqlite-export.json`

To import that data into a fresh Postgres database:

```powershell
npm run db:import-backup
```

The import script expects an empty database and preserves the existing IDs and relationships so the current app data carries over cleanly.
