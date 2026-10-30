create table public.clubs (
  name text primary key,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.clubs enable row level security;

insert into public.clubs (name)
select distinct trim(club)
from public.events
where nullif(trim(club), '') is not null
on conflict (name) do nothing;

grant select on table public.clubs to service_role;

create table public.agent_lessons (
  id uuid primary key default gen_random_uuid(),
  lesson text not null check (char_length(trim(lesson)) between 1 and 280),
  created_at timestamptz not null default now(),
  created_by text not null default ''
);

alter table public.agent_lessons enable row level security;

create policy "authenticated can read agent lessons"
  on public.agent_lessons
  for select
  to authenticated
  using (true);

create policy "authenticated can add agent lessons"
  on public.agent_lessons
  for insert
  to authenticated
  with check (
    created_by = (select auth.uid()::text)
    and char_length(trim(lesson)) between 1 and 280
  );

grant select on table public.agent_lessons to authenticated;
grant insert (lesson, created_by) on table public.agent_lessons to authenticated;
grant select on table public.agent_lessons to service_role;

alter table public.events
  add column memory_sources jsonb not null default '[]'::jsonb;

grant select (memory_sources) on table public.events to authenticated;
