-- Health Tracker schema
-- Run this in the Supabase SQL editor (or via `supabase db push`).
-- Every table is scoped to auth.uid() via Row Level Security so users
-- can only ever see and modify their own rows.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles
-- One row per user. Currently just stores height, used to auto-calculate
-- BMI on the body_metrics log form when present.
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  height_cm numeric(5, 1) check (height_cm > 0),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- workouts
-- ---------------------------------------------------------------------------
create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null default current_date,
  exercise text not null,
  sets integer check (sets >= 0),
  reps integer check (reps >= 0),
  weight numeric(6, 2) check (weight >= 0),
  created_at timestamptz not null default now()
);

create index if not exists workouts_user_date_idx
  on public.workouts (user_id, date desc);

-- ---------------------------------------------------------------------------
-- workout_templates
-- Shared reference data (not user-scoped) - the Upper/Lower split exercises
-- the /workouts/log form pre-fills from. Rep ranges are in reps except for
-- Plank/side-plank, which are seconds (kept in the same numeric columns;
-- the app infers the unit from the exercise name for display).
-- ---------------------------------------------------------------------------
create table if not exists public.workout_templates (
  id uuid primary key default gen_random_uuid(),
  day_name text not null,
  exercise_name text not null,
  target_sets integer not null check (target_sets > 0),
  target_rep_range_low integer not null check (target_rep_range_low > 0),
  target_rep_range_high integer not null check (target_rep_range_high >= target_rep_range_low),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (day_name, exercise_name)
);

insert into public.workout_templates
  (day_name, exercise_name, target_sets, target_rep_range_low, target_rep_range_high, sort_order)
values
  ('Day 1 – Upper (Push)', 'Bench press', 3, 8, 10, 1),
  ('Day 1 – Upper (Push)', 'Seated shoulder press', 3, 8, 10, 2),
  ('Day 1 – Upper (Push)', 'Lat pulldown', 3, 10, 10, 3),
  ('Day 1 – Upper (Push)', 'Incline dumbbell press', 3, 10, 10, 4),
  ('Day 1 – Upper (Push)', 'Cable tricep pushdown', 2, 12, 12, 5),
  ('Day 1 – Upper (Push)', 'Face pulls', 2, 15, 15, 6),

  ('Day 2 – Lower', 'Leg press/squat', 4, 8, 10, 1),
  ('Day 2 – Lower', 'Romanian deadlift', 3, 10, 10, 2),
  ('Day 2 – Lower', 'Leg curl', 3, 12, 12, 3),
  ('Day 2 – Lower', 'Leg extension', 2, 12, 12, 4),
  ('Day 2 – Lower', 'Standing calf raise', 3, 15, 15, 5),
  ('Day 2 – Lower', 'Plank', 3, 30, 45, 6),

  ('Day 4 – Upper (Pull)', 'Lat pulldown/pull-up', 3, 8, 10, 1),
  ('Day 4 – Upper (Pull)', 'Seated cable row', 3, 10, 10, 2),
  ('Day 4 – Upper (Pull)', 'Dumbbell shoulder press', 3, 10, 10, 3),
  ('Day 4 – Upper (Pull)', 'Bicep curl', 2, 12, 12, 4),
  ('Day 4 – Upper (Pull)', 'Rear delt fly', 2, 15, 15, 5),
  ('Day 4 – Upper (Pull)', 'Hanging knee raise', 3, 12, 12, 6),

  ('Day 5 – Lower (variation)', 'Deadlift/hip thrust', 3, 8, 8, 1),
  ('Day 5 – Lower (variation)', 'Bulgarian split squat (per leg)', 3, 10, 10, 2),
  ('Day 5 – Lower (variation)', 'Leg press', 3, 12, 12, 3),
  ('Day 5 – Lower (variation)', 'Seated/standing calf raise', 3, 15, 15, 4),
  ('Day 5 – Lower (variation)', 'Cable woodchop/side plank', 2, 12, 12, 5)
on conflict (day_name, exercise_name) do nothing;

-- ---------------------------------------------------------------------------
-- meals
-- ---------------------------------------------------------------------------
create table if not exists public.meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null default current_date,
  meal_name text not null,
  protein_g numeric(6, 2) check (protein_g >= 0),
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists meals_user_date_idx
  on public.meals (user_id, date desc);

-- ---------------------------------------------------------------------------
-- meal_presets
-- Per-user quick-add shortcuts for the meals log form (e.g. "2 eggs" = 12g).
-- ---------------------------------------------------------------------------
create table if not exists public.meal_presets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  protein_g numeric(6, 2) not null check (protein_g >= 0),
  created_at timestamptz not null default now()
);

create index if not exists meal_presets_user_idx
  on public.meal_presets (user_id, created_at);

-- ---------------------------------------------------------------------------
-- water_logs
-- ---------------------------------------------------------------------------
create table if not exists public.water_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null default current_date,
  amount_ml integer not null check (amount_ml > 0),
  created_at timestamptz not null default now()
);

create index if not exists water_logs_user_date_idx
  on public.water_logs (user_id, date desc);

-- ---------------------------------------------------------------------------
-- body_metrics
-- ---------------------------------------------------------------------------
create table if not exists public.body_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  test_date date not null default current_date,
  weight numeric(5, 2) check (weight > 0),
  skeletal_muscle numeric(5, 2) check (skeletal_muscle >= 0),
  body_fat_pct numeric(4, 1) check (body_fat_pct >= 0 and body_fat_pct <= 100),
  visceral_fat numeric(4, 1) check (visceral_fat >= 0),
  bmi numeric(4, 1) check (bmi >= 0),
  created_at timestamptz not null default now()
);

create index if not exists body_metrics_user_test_date_idx
  on public.body_metrics (user_id, test_date desc);

-- ---------------------------------------------------------------------------
-- medication_logs
-- ---------------------------------------------------------------------------
create table if not exists public.medication_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null default current_date,
  dose_mg numeric(8, 2) not null default 2.5,
  injection_site text check (injection_site in ('abdomen', 'thigh', 'upper arm')),
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists medication_logs_user_date_idx
  on public.medication_logs (user_id, date desc);

-- ---------------------------------------------------------------------------
-- blood_markers
-- ---------------------------------------------------------------------------
create table if not exists public.blood_markers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  test_date date not null default current_date,
  marker_name text not null, -- e.g. 'LDL Cholesterol', 'HbA1c', 'Vitamin D'
  category text not null default 'Other', -- e.g. 'Lipid Panel', 'Thyroid'
  result numeric(10, 3) not null,
  unit text not null,
  flag text not null default 'normal'
    check (flag in ('low', 'normal', 'high', 'critical_low', 'critical_high')),
  ref_range_low numeric(10, 3),
  ref_range_high numeric(10, 3),
  ref_range_text text, -- for qualitative/non-numeric ranges, e.g. 'Negative', '<5.0'
  created_at timestamptz not null default now()
);

create index if not exists blood_markers_user_test_date_idx
  on public.blood_markers (user_id, test_date desc);

create index if not exists blood_markers_user_marker_idx
  on public.blood_markers (user_id, marker_name, test_date);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.workouts enable row level security;

-- workout_templates is shared reference data (no user_id): everyone signed
-- in can read it, nobody can write it through the app.
alter table public.workout_templates enable row level security;
create policy "workout_templates_select_all" on public.workout_templates
  for select using (true);

alter table public.meals enable row level security;
alter table public.meal_presets enable row level security;
alter table public.water_logs enable row level security;
alter table public.body_metrics enable row level security;
alter table public.medication_logs enable row level security;
alter table public.blood_markers enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles', 'workouts', 'meals', 'meal_presets', 'water_logs',
    'body_metrics', 'medication_logs', 'blood_markers'
  ]
  loop
    execute format($f$
      create policy "%1$s_select_own" on public.%1$s
        for select using (auth.uid() = user_id);
    $f$, t);

    execute format($f$
      create policy "%1$s_insert_own" on public.%1$s
        for insert with check (auth.uid() = user_id);
    $f$, t);

    execute format($f$
      create policy "%1$s_update_own" on public.%1$s
        for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
    $f$, t);

    execute format($f$
      create policy "%1$s_delete_own" on public.%1$s
        for delete using (auth.uid() = user_id);
    $f$, t);
  end loop;
end $$;
