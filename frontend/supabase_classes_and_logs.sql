-- Classes, admin-created children, and per-lesson learning logs.
-- Run this in the Supabase SQL Editor. Idempotent and ordered.

-- 0. PRE-FLIGHT: the unique PIN index below fails if duplicates already exist.
--    This block raises a clear error listing the offending PINs. Resolve them
--    (re-assign duplicates), then re-run the whole file.
do $$
declare
  dup_count int;
begin
  select count(*) into dup_count from (
    select pin_code from children
    where pin_code is not null
    group by pin_code having count(*) > 1
  ) d;
  if dup_count > 0 then
    raise exception
      'Found % duplicate pin_code value(s). Run: select pin_code, count(*) from children where pin_code is not null group by pin_code having count(*) > 1;  Resolve, then re-run.', dup_count;
  end if;
end $$;

-- 1. classes
create table if not exists classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 2. children: allow class children (no parent) + class membership
alter table children alter column parent_id drop not null;
alter table children add column if not exists class_id uuid references classes(id) on delete set null;
create unique index if not exists children_pin_code_unique on children(pin_code) where pin_code is not null;

-- 3. lesson_logs
create table if not exists lesson_logs (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children(id) on delete cascade,
  topic_key text not null,
  lesson_id text not null,
  started_at timestamptz,
  finished_at timestamptz,
  duration_seconds int,
  mistake_count int,
  xp_earned int,
  is_first_completion boolean,
  created_at timestamptz not null default now()
);
create index if not exists lesson_logs_child_finished_idx on lesson_logs(child_id, finished_at desc);

-- 4. RLS
alter table classes enable row level security;
-- classes: no anon/auth policies -> only service_role (admin API) can touch it.

alter table lesson_logs enable row level security;
-- lesson_logs: anon/auth may INSERT only; no SELECT/UPDATE/DELETE policy ->
-- logs are write-only from the browser, readable only via service_role.
drop policy if exists lesson_logs_anon_insert on lesson_logs;
create policy lesson_logs_anon_insert on lesson_logs
  for insert to anon, authenticated
  with check (true);

-- 5. Aggregate totals for a child's logs — computed in the DB so the admin
-- log page reports correct lifetime totals regardless of row count (a plain
-- select is capped at 1000 rows by PostgREST and would silently undercount).
create or replace function child_log_totals(p_child_id uuid)
returns table(lessons bigint, seconds bigint, mistakes bigint, xp bigint)
language sql
stable
as $$
  select
    count(*)::bigint,
    coalesce(sum(duration_seconds), 0)::bigint,
    coalesce(sum(mistake_count), 0)::bigint,
    coalesce(sum(xp_earned), 0)::bigint
  from lesson_logs
  where child_id = p_child_id;
$$;
