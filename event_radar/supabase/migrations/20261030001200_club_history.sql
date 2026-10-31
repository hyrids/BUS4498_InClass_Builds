alter table public.events
  add column if not exists replaced_by uuid,
  add column if not exists updates_id uuid;

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conrelid = 'public.events'::regclass
      and conname = 'events_status_check'
  ) then
    alter table public.events drop constraint events_status_check;
  end if;
end
$$;

alter table public.events
  add constraint events_status_check
  check (status in ('published', 'waiting', 'rejected', 'archived', 'replaced'));

drop policy if exists "authenticated can review events" on public.events;
create policy "authenticated can review events"
  on public.events
  for update
  to authenticated
  using (true)
  with check (status in ('published', 'waiting', 'rejected', 'replaced'));

grant select on public.events to authenticated;
grant update (status, status_reason, reviewed_at, reviewed_by)
  on public.events to authenticated;
