revoke all privileges on table public.events from anon, authenticated;

grant select (
  id,
  created_at,
  status,
  title,
  club,
  event_date,
  start_time,
  end_time,
  place_name,
  place_detail,
  cost,
  free_food,
  summary
) on table public.events to anon, authenticated;
