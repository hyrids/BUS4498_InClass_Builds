create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

alter table public.clubs
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists nicknames text not null default '',
  add column if not exists usual_place_code text not null default '',
  add column if not exists usual_place_detail text not null default '',
  add column if not exists note text not null default '';

update public.clubs set id = gen_random_uuid() where id is null;
alter table public.clubs alter column id set not null;
create unique index if not exists clubs_id_key on public.clubs (id);

insert into public.clubs (name, nicknames, usual_place_code, usual_place_detail, note)
values
  ('Board Game Guild', 'BGG, board game club', 'UU', 'Room 220', ''),
  ('Mustang Pitch Society', 'MPS, pitch society', 'UU-PLAZA', '', ''),
  ('Women in Finance Circle', 'WIFC, women in finance', 'BUSINESS', '', ''),
  ('Sustainability Crew', 'SC, sustainability club', 'DEXTER-LAWN', '', ''),
  ('Accounting Society', 'accounting club', 'BUSINESS', '', ''),
  ('Cal Poly Ski & Snowboard Club', 'ski club, snowboard club', 'REC-CENTER', '', '')
on conflict (name) do update set
  nicknames = excluded.nicknames,
  usual_place_code = excluded.usual_place_code,
  usual_place_detail = excluded.usual_place_detail,
  note = excluded.note,
  active = true;

alter table public.clubs enable row level security;
drop policy if exists "anon and authenticated can read active clubs" on public.clubs;
create policy "anon and authenticated can read active clubs"
  on public.clubs
  for select
  to anon, authenticated
  using (active);
revoke all on public.clubs from anon, authenticated;
grant select (id, name, nicknames, active) on public.clubs to anon, authenticated;
grant all on public.clubs to service_role;

alter table public.events
  add column if not exists agent_notes text[] not null default '{}',
  add column if not exists replaced_by uuid,
  add column if not exists updates_id uuid,
  add column if not exists lessons_used text[] not null default '{}',
  add column if not exists source text not null default '',
  add column if not exists source_id text not null default '',
  add column if not exists source_name text not null default '';

create unique index if not exists events_one_per_message
  on public.events (source, source_id)
  where source_id <> '';

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  lesson text not null check (char_length(trim(lesson)) between 5 and 300),
  active boolean not null default true,
  created_by text not null default '',
  from_post uuid
);

insert into public.lessons (lesson, active, created_by, from_post)
select lesson, true, created_by, null
from public.agent_lessons
where char_length(trim(lesson)) between 5 and 300
  and not exists (select 1 from public.lessons existing where existing.lesson = public.agent_lessons.lesson);

alter table public.lessons enable row level security;
drop policy if exists "authenticated can read lessons" on public.lessons;
drop policy if exists "authenticated can add lessons" on public.lessons;
drop policy if exists "authenticated can update lessons" on public.lessons;
create policy "authenticated can read lessons"
  on public.lessons for select to authenticated using (true);
create policy "authenticated can add lessons"
  on public.lessons for insert to authenticated
  with check (char_length(trim(lesson)) between 5 and 300);
create policy "authenticated can update lessons"
  on public.lessons for update to authenticated
  using (true)
  with check (char_length(trim(lesson)) between 5 and 300);
revoke all on public.lessons from anon, authenticated;
grant select on public.lessons to authenticated;
grant insert (lesson, created_by, from_post) on public.lessons to authenticated;
grant update (active) on public.lessons to authenticated;
grant all on public.lessons to service_role;

create table if not exists public.channel_cursor (
  source text primary key,
  last_id text not null default '',
  read_count integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.channel_cursor enable row level security;
revoke all on public.channel_cursor from anon, authenticated;
grant all on public.channel_cursor to service_role;

select cron.unschedule(jobid)
from cron.job
where jobname = 'read-chat-channel';

select cron.schedule(
  'read-chat-channel',
  '* * * * *',
  $$
  select net.http_post(
    url := 'https://bhrkeunjxvyyopmxexnp.supabase.co/functions/v1/read-channel',
    headers := '{"Content-Type":"application/json","apikey":"sb_publishable_J15PEVNyGwdAa6imSUSiPw_MbWZL8NQ"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
