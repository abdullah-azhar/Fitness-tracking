# Health Tracker

A Next.js 14 (App Router) PWA for tracking workouts, meals, water, body
metrics, medications (Mounjaro dosing), and blood markers. Styled with
Tailwind CSS, state managed with Zustand, backed by Supabase (Postgres +
Auth).

## Stack

- **Next.js 14** — App Router, TypeScript
- **Tailwind CSS** — styling
- **Zustand** — client state (auth session, dashboard data, cached body
  metrics/workouts, toasts)
- **Supabase** — Postgres database, auth, row-level security
- **Recharts** — body metrics trend charts
- **next-pwa** — service worker + installable manifest

## Setup

1. Create a project at [supabase.com](https://supabase.com/dashboard).
2. In the SQL editor, run [`supabase/schema.sql`](supabase/schema.sql) to
   create the `profiles`, `workouts`, `workout_templates`, `meals`,
   `meal_presets`, `water_logs`, `body_metrics`, `medication_logs`, and
   `blood_markers` tables (with RLS policies scoping every row to
   `auth.uid()` — `workout_templates` is the one exception, since it's
   shared reference data everyone can read). The script also seeds
   `workout_templates` with a 4-day Upper/Lower split.
3. Copy `.env.local.example` to `.env.local` and fill in your project's URL
   and anon key from **Project Settings → API**:

   ```bash
   cp .env.local.example .env.local
   ```

4. Install dependencies and start the dev server:

   ```bash
   npm install
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) — you'll land on
   `/login`. Sign up with an email/password (Supabase sends a confirmation
   email by default; you can disable that in **Authentication → Providers →
   Email** for local testing).

The PWA service worker is disabled in development and only builds in
`npm run build` / `npm run start`.

## Project layout

- `supabase/schema.sql` — table definitions + RLS policies for `profiles`,
  `workouts`, `workout_templates`, `meals`, `meal_presets`, `water_logs`,
  `body_metrics`, `medication_logs`, `blood_markers`
- `src/types/database.types.ts` — hand-written types mirroring the schema
- `src/lib/supabase/` — browser, server, and middleware Supabase clients;
  `server.ts` exports a request-memoized `getUser()`
- `src/lib/goals.ts` — the daily protein/water targets used by every
  progress bar; `src/lib/logging.ts` — shared insert helpers for
  meals/water so the dashboard's quick-log buttons and the dedicated log
  pages can't drift apart; `src/lib/workouts.ts` — target-range formatting
  and the progressive-overload check; `src/lib/medication.ts` — the
  injection-due-soon threshold; `src/lib/bloodMarkerPresets.ts` — the 12
  priority markers with standard unit/reference-range defaults for the
  log form's dropdown; `src/lib/bloodMarkers.ts` — flag colors/auto-calc
  plus `rankMostOutOfRange` for the dashboard card
- `src/store/` — Zustand stores: `useAuthStore`; `useTodayLogStore` holds
  today's meals + water logs (derived protein/water totals via
  `selectProteinTotal`/`selectWaterTotal`) and the most recent body metric,
  cached per user/day so logging from anywhere updates every consumer
  instantly with no refetch; `useBodyMetricsStore` caches the full
  body-metrics history for `/body-metrics/trends`; `useWorkoutStore` caches
  every logged workout set so `/workouts/log` can pre-fill each exercise's
  last-used weight (`selectLastUsedWeight`) and `/workouts/history` can
  group sessions by date and sparkline recent weights
  (`selectSessionsByDate`, `selectRecentWeights`) without refetching;
  `useToastStore` backs the global toaster
- `src/app/login` — email/password sign in & sign up
- `src/app/(protected)/layout.tsx` — auth guard: redirects to `/login` if
  there's no session. Every route nested under `(protected)` requires auth
  (route groups don't affect the URL, so this still serves `/dashboard`,
  `/blood-tests/*`, `/body-metrics/*`, `/meals/*`, `/water/*`,
  `/workouts/*`, and `/medication/*`)
- `src/app/(protected)/dashboard` — protein/water progress bars, last body
  metrics, inline quick-log widgets (one-tap water buttons, one-tap meal
  presets), a medication reminder (flags "Injection due soon" once the
  last dose is 6+ days old), and a "Health markers" card surfacing the 3
  most out-of-range blood markers
- `src/app/(protected)/meals/log` — full meal form with a customizable,
  per-user quick-add preset list (stored in `meal_presets`) that pre-fills
  the form, plus today's running protein total and log
- `src/app/(protected)/water/log` — large one-tap buttons for 250ml/500ml/1L,
  a progress bar toward the daily goal, and an undo button for the last entry
- `src/app/(protected)/blood-tests` — `log` (marker dropdown of 12 priority
  markers + "Other", with unit/category/reference range auto-filled per
  marker and the flag auto-calculated) and `history` (per-marker charts
  with the reference range shaded, color-coded by flag)
- `src/app/(protected)/medication` — `log` (Mounjaro dose, defaults to
  2.5mg, injection site, notes) and `history` (current dose highlighted at
  the top, past injections below)
- `src/app/(protected)/body-metrics` — `log` (weight/muscle/fat/visceral
  fat/BMI, with BMI auto-calculated from a height stored in `profiles`) and
  `trends` (latest-vs-previous summary, four Recharts line charts, a full
  history table)
- `src/app/(protected)/workouts` — `log` (pick a day from `workout_templates`,
  log actual sets/reps/weight per exercise against the target range, with a
  live "you hit the top of your range" banner and weight pre-filled from
  your last session) and `history` (sessions grouped by date, expandable,
  each exercise with a small sparkline of its last 5 weights)
- `middleware.ts` — refreshes the Supabase session and redirects
  unauthenticated requests to `/login` (defense-in-depth alongside the
  `(protected)` layout, which is the real authorization boundary)

## Extending the schema

If you evolve `supabase/schema.sql`, regenerate the TypeScript types with
the Supabase CLI instead of hand-editing them:

```bash
npx supabase gen types typescript --project-id <your-project-ref> > src/types/database.types.ts
```
