# Tasks

A fast, category-first task tracker with day planning. See [`PRD.md`](../PRD.md) (or the doc you wrote the spec in) for the full product spec — this file just covers running and deploying it.

Works with no setup at all: without Supabase configured, the app runs in **local-only mode** (data lives in the browser's `localStorage`). Add Supabase credentials to get sync across devices.

## Run it locally

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`.

## Set up Supabase (for cross-device sync)

1. Create a free project at [supabase.com](https://supabase.com).
2. In the Supabase dashboard, go to **SQL Editor → New query**, paste the contents of [`supabase/schema.sql`](supabase/schema.sql), and run it. This creates the `categories` and `tasks` tables with row-level security scoped to your user.
3. In **Project Settings → API**, copy the **Project URL** and **anon public** key.
4. Copy `.env.example` to `.env` and fill in the two values:

   ```bash
   cp .env.example .env
   ```

   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
5. Restart `npm run dev`. You'll now see a sign-in screen — enter your email and it sends a magic link (no password to set up). Click the link to sign in.
6. In **Authentication → Providers → Email**, magic links are on by default. If you want to lock the app down to just yourself, go to **Authentication → Settings** and consider disabling public sign-ups after your first login, or restrict via an allow-list — this is a single-user app, so anyone who signs in shares your data.

Once signed in, every category/task mutation syncs to Supabase, and the app also queues mutations locally and replays them when it comes back online — so it keeps working on a flaky connection or offline, then syncs when reconnected.

## Deploy (Vercel or Netlify, free tier)

**Vercel:**
```bash
npm install -g vercel
vercel
```
Set the two `VITE_SUPABASE_*` env vars in the Vercel project settings (Project → Settings → Environment Variables), then redeploy.

**Netlify:**
```bash
npm install -g netlify-cli
netlify deploy --build
```
Set the same env vars under Site settings → Environment variables.

Either host serves the built PWA — visit the deployed URL on your phone and use "Add to Home Screen" (Safari: Share → Add to Home Screen; Chrome: menu → Install app) to install it.

## What's here

- `src/lib/store.tsx` — all state + the offline-first sync logic (local cache, mutation queue, auto-carry)
- `src/lib/supabase.ts` — Supabase client, only initialized if env vars are present
- `src/components/` — Dashboard (category cards), WeekStrip (day planner), and the shared bits (CheckCircle, QuickAdd, ScheduleMenu)
- `supabase/schema.sql` — run this once in the Supabase SQL editor to create your tables

## Notes on scope

- No recurring tasks, reminders, or multi-user support — see the PRD's Non-Goals.
- Auto-carry runs client-side: unfinished tasks from a past day roll onto today whenever the app is open (on load, and rechecked every 5 minutes). There's no server cron, so a task won't visibly carry forward until you open the app on the new day — which matches how you'd actually use it.
