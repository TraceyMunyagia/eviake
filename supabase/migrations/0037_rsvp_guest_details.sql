-- Save the guest's phone number and keep the response details available to
-- the private RSVP tracking link.
drop function if exists public.submit_public_rsvp(text, text, boolean, integer, jsonb);

create or replace function public.submit_public_rsvp(
  p_slug text,
  p_name text,
  p_phone text,
  p_attending boolean,
  p_party_size int,
  p_answers jsonb
)
returns jsonb
language plpgsql
security definer set search_path = public
as $$
declare
  v_invite record;
  v_guest_id uuid;
  v_token text;
begin
  select * into v_invite from public.invites where public_slug = p_slug and status = 'published';
  if v_invite is null then
    raise exception 'invite not found';
  end if;
  if v_invite.event_id is null then
    raise exception 'this invite is not yet accepting RSVPs';
  end if;
  if p_name is null or length(trim(p_name)) = 0 then
    raise exception 'name is required';
  end if;
  if p_phone is null or length(trim(p_phone)) = 0 then
    raise exception 'phone is required';
  end if;

  insert into public.guests (business_id, event_id, name, phone, plus_ones)
  values (v_invite.business_id, v_invite.event_id, trim(p_name), trim(p_phone), greatest(0, coalesce(p_party_size, 1) - 1))
  returning id, check_in_token into v_guest_id, v_token;

  update public.rsvps
  set status = case when p_attending then 'attending' else 'declined' end,
      answers = coalesce(p_answers, '{}'::jsonb)
  where guest_id = v_guest_id;

  return jsonb_build_object(
    'guest_id', v_guest_id,
    'status', case when p_attending then 'attending' else 'declined' end,
    'check_in_token', v_token
  );
end;
$$;

grant execute on function public.submit_public_rsvp(text, text, text, boolean, integer, jsonb) to anon;

create or replace function public.get_rsvp_summary_by_token(p_token text)
returns jsonb
language plpgsql stable security definer set search_path = public
as $$
declare
  v_invite record;
  v_guests jsonb;
  v_counts jsonb;
begin
  select * into v_invite from public.invites where rsvp_track_token = p_token and status = 'published';
  if v_invite.event_id is null then
    return null;
  end if;

  select jsonb_agg(jsonb_build_object(
    'name', g.name, 'phone', g.phone, 'plus_ones', g.plus_ones, 'status', r.status,
    'responded_at', r.responded_at, 'checked_in_at', g.checked_in_at,
    'answers', coalesce(r.answers, '{}'::jsonb)
  ) order by r.responded_at desc nulls last, g.created_at desc)
  into v_guests
  from public.guests g join public.rsvps r on r.guest_id = g.id
  where g.event_id = v_invite.event_id;

  select jsonb_build_object(
    'attending', count(*) filter (where r.status = 'attending'),
    'declined', count(*) filter (where r.status = 'declined'),
    'pending', count(*) filter (where r.status = 'pending'),
    'heads_attending', coalesce(sum(1 + g.plus_ones) filter (where r.status = 'attending'), 0),
    'checked_in', count(*) filter (where g.checked_in_at is not null)
  )
  into v_counts
  from public.guests g join public.rsvps r on r.guest_id = g.id
  where g.event_id = v_invite.event_id;

  return jsonb_build_object(
    'counts', v_counts,
    'questions', coalesce(v_invite.content->'rsvp_questions', '[]'::jsonb),
    'guests', coalesce(v_guests, '[]'::jsonb)
  );
end;
$$;

revoke execute on function public.get_rsvp_summary_by_token(text) from public;
grant execute on function public.get_rsvp_summary_by_token(text) to anon, authenticated;
