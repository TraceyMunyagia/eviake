create or replace function public.get_rsvp_summary_by_token(p_token text)
returns jsonb
language plpgsql stable security definer set search_path = public
as $$
declare
  v_event_id uuid;
  v_guests jsonb;
  v_counts jsonb;
begin
  select event_id into v_event_id from public.invites where rsvp_track_token = p_token and status = 'published';
  if v_event_id is null then
    return null;
  end if;

  select jsonb_agg(jsonb_build_object(
    'name', g.name, 'plus_ones', g.plus_ones, 'status', r.status, 'responded_at', r.responded_at
  ) order by r.responded_at desc nulls last, g.created_at desc)
  into v_guests
  from public.guests g join public.rsvps r on r.guest_id = g.id
  where g.event_id = v_event_id;

  select jsonb_build_object(
    'attending', count(*) filter (where r.status = 'attending'),
    'declined', count(*) filter (where r.status = 'declined'),
    'pending', count(*) filter (where r.status = 'pending'),
    'heads_attending', coalesce(sum(1 + g.plus_ones) filter (where r.status = 'attending'), 0)
  )
  into v_counts
  from public.guests g join public.rsvps r on r.guest_id = g.id
  where g.event_id = v_event_id;

  return jsonb_build_object('counts', v_counts, 'guests', coalesce(v_guests, '[]'::jsonb));
end;
$$;

revoke execute on function public.get_rsvp_summary_by_token(text) from public, authenticated;
grant execute on function public.get_rsvp_summary_by_token(text) to anon, authenticated;
