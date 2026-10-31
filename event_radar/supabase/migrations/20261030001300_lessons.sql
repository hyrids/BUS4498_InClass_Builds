create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  lesson text not null check (char_length(trim(lesson)) between 5 and 300),
  active boolean not null default true,
  created_by text not null default '',
  from_post uuid
);

alter table public.lessons
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists lesson text not null default '',
  add column if not exists active boolean not null default true,
  add column if not exists created_by text not null default '',
  add column if not exists from_post uuid;

alter table public.lessons enable row level security;
revoke all on public.lessons from anon, authenticated;
drop policy if exists "authenticated can read lessons" on public.lessons;
drop policy if exists "authenticated can add lessons" on public.lessons;
drop policy if exists "authenticated can update lessons" on public.lessons;

create policy "authenticated can read lessons"
  on public.lessons
  for select
  to authenticated
  using (true);

create policy "authenticated can add lessons"
  on public.lessons
  for insert
  to authenticated
  with check (char_length(trim(lesson)) between 5 and 300);

create policy "authenticated can update lessons"
  on public.lessons
  for update
  to authenticated
  using (true)
  with check (char_length(trim(lesson)) between 5 and 300);

grant select on public.lessons to authenticated;
grant insert (lesson, created_by, from_post) on public.lessons to authenticated;
grant update (active) on public.lessons to authenticated;
grant all on public.lessons to service_role;

alter table public.events
  add column if not exists lessons_used text[] not null default '{}';
