create or replace function public.submit_public_rsvp(
  p_slug text,
  p_name text,
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

  insert into public.guests (business_id, event_id, name, plus_ones)
  values (v_invite.business_id, v_invite.event_id, trim(p_name), greatest(0, coalesce(p_party_size, 1) - 1))
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