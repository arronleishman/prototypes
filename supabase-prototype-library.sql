-- Internal prototype library metadata and private developer files.
-- Run once in the Supabase SQL editor, then enable email/magic-link auth
-- and disable anonymous sign-ups in Authentication settings.

create table if not exists prototype_library (
  id text primary key,
  title text not null,
  description text not null default '',
  path text not null default '',
  status text not null default 'draft',
  updated date,
  source text not null default 'managed',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists prototype_versions (
  id uuid primary key default gen_random_uuid(),
  prototype_id text not null references prototype_library(id) on delete cascade,
  label text not null,
  summary text not null default '',
  commit_sha text,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null
);

create table if not exists prototype_artifacts (
  id uuid primary key default gen_random_uuid(),
  prototype_id text not null references prototype_library(id) on delete cascade,
  version_id uuid references prototype_versions(id) on delete set null,
  kind text not null check (kind in ('mock', 'instruction', 'instructions', 'component', 'components', 'code', 'storybook', 'other')),
  name text not null,
  description text not null default '',
  storage_path text not null unique,
  mime_type text not null default 'application/octet-stream',
  size bigint not null default 0,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null
);

create index if not exists prototype_versions_lookup_idx
  on prototype_versions (prototype_id, created_at desc);

create index if not exists prototype_artifacts_lookup_idx
  on prototype_artifacts (prototype_id, kind, created_at desc);

alter table prototype_library enable row level security;
alter table prototype_versions enable row level security;
alter table prototype_artifacts enable row level security;
alter table prototype_versions add column if not exists commit_sha text;

drop policy if exists "Authenticated users can read prototype library" on prototype_library;
drop policy if exists "Authenticated users can manage prototype library" on prototype_library;
drop policy if exists "Authenticated users can read prototype versions" on prototype_versions;
drop policy if exists "Authenticated users can manage prototype versions" on prototype_versions;
drop policy if exists "Authenticated users can read prototype artifacts" on prototype_artifacts;
drop policy if exists "Authenticated users can manage prototype artifacts" on prototype_artifacts;

create policy "Authenticated users can read prototype library"
  on prototype_library for select to authenticated using (true);
create policy "Authenticated users can manage prototype library"
  on prototype_library for all to authenticated using (true) with check (true);

create policy "Authenticated users can read prototype versions"
  on prototype_versions for select to authenticated using (true);
create policy "Authenticated users can manage prototype versions"
  on prototype_versions for all to authenticated using (true) with check (true);

create policy "Authenticated users can read prototype artifacts"
  on prototype_artifacts for select to authenticated using (true);
create policy "Authenticated users can manage prototype artifacts"
  on prototype_artifacts for all to authenticated using (true) with check (true);

create unique index if not exists prototype_versions_commit_idx
  on prototype_versions (prototype_id, commit_sha)
  where commit_sha is not null;

insert into storage.buckets (id, name, public)
values ('prototype-artifacts', 'prototype-artifacts', false)
on conflict (id) do update set public = false;

drop policy if exists "Authenticated users can read prototype artifact files" on storage.objects;
drop policy if exists "Authenticated users can upload prototype artifact files" on storage.objects;
drop policy if exists "Authenticated users can update prototype artifact files" on storage.objects;
drop policy if exists "Authenticated users can delete prototype artifact files" on storage.objects;

create policy "Authenticated users can read prototype artifact files"
  on storage.objects for select to authenticated
  using (bucket_id = 'prototype-artifacts');

create policy "Authenticated users can upload prototype artifact files"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'prototype-artifacts');

create policy "Authenticated users can update prototype artifact files"
  on storage.objects for update to authenticated
  using (bucket_id = 'prototype-artifacts')
  with check (bucket_id = 'prototype-artifacts');

create policy "Authenticated users can delete prototype artifact files"
  on storage.objects for delete to authenticated
  using (bucket_id = 'prototype-artifacts');
