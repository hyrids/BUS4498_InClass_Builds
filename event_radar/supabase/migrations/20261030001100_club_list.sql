create table if not exists public.clubs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  nicknames text not null default '',
  usual_place_code text not null default '',
  usual_place_detail text not null default '',
  active boolean not null default true,
  note text not null default ''
);

alter table public.clubs
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists nicknames text not null default '',
  add column if not exists usual_place_code text not null default '',
  add column if not exists usual_place_detail text not null default '',
  add column if not exists active boolean not null default true,
  add column if not exists note text not null default '';

update public.clubs
set id = gen_random_uuid()
where id is null;

alter table public.clubs alter column id set not null;

create unique index if not exists clubs_name_key on public.clubs (name);

insert into public.clubs (name, nicknames, usual_place_code, usual_place_detail, note)
values
  ('Board Game Guild', 'BGG, board game club', 'UU', 'Room 220', ''),
  ('Mustang Pitch Society', 'MPS, pitch society', 'UU-PLAZA', '', ''),
  ('Women in Finance Circle', 'WIFC, women in finance', 'BUSINESS', '', ''),
  ('Sustainability Crew', 'SC, sustainability club', 'DEXTER-LAWN', '', ''),
  ('Accounting Society', 'accounting club', 'BUSINESS', '', ''),
  ('Cal Poly Ski & Snowboard Club', 'ski club, snowboard club', 'REC-CENTER', '', '')
on conflict (name) do nothing;

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
  add column if not exists agent_notes text[] not null default '{}';
