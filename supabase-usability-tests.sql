-- Usability test definitions and anonymous participant runs.
-- Run once in Supabase after supabase-telemetry.sql.

create table if not exists usability_tests (
  id uuid primary key default gen_random_uuid(),
  prototype_id text not null,
  version_id text,
  title text not null,
  intro text not null default '',
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  tasks jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null
);

create table if not exists usability_test_runs (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references usability_tests(id) on delete cascade,
  prototype_id text not null,
  version_id text,
  session_id text not null,
  status text not null default 'started' check (status in ('started', 'completed', 'abandoned')),
  task_results jsonb not null default '[]'::jsonb,
  metrics jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists usability_tests_prototype_idx
  on usability_tests (prototype_id, updated_at desc);

create unique index if not exists usability_tests_one_active_idx
  on usability_tests (prototype_id)
  where status = 'active';

create index if not exists usability_test_runs_lookup_idx
  on usability_test_runs (prototype_id, test_id, started_at desc);

alter table usability_tests enable row level security;
alter table usability_test_runs enable row level security;

drop policy if exists "Public can read active usability tests" on usability_tests;
drop policy if exists "Authenticated users can manage usability tests" on usability_tests;
drop policy if exists "Participants can submit usability runs" on usability_test_runs;
drop policy if exists "Authenticated users can read usability runs" on usability_test_runs;

create policy "Public can read active usability tests"
  on usability_tests for select to anon, authenticated
  using (status = 'active');

create policy "Authenticated users can manage usability tests"
  on usability_tests for all to authenticated
  using (true) with check (true);

create policy "Participants can submit usability runs"
  on usability_test_runs for insert to anon, authenticated
  with check (true);

create policy "Authenticated users can read usability runs"
  on usability_test_runs for select to authenticated
  using (true);
