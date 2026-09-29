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
begin
  select * into v_invite from public.invites where public_slug = p_slug and status = 'published';
  if v_invite is null then raise exception 'invite not found'; end if;
  if v_invite.event_id is null then raise exception 'this invite is not yet accepting RSVPs'; end if;
  if p_name is null or length(trim(p_name)) = 0 then raise exception 'name is required'; end if;
  if p_phone is null or length(trim(p_phone)) = 0 then raise exception 'phone number is required'; end if;

  insert into public.guests (business_id, event_id, name, phone, plus_ones)
  values (v_invite.business_id, v_invite.event_id, trim(p_name), trim(p_phone), greatest(0, coalesce(p_party_size, 1) - 1))
  returning id into v_guest_id;

  update public.rsvps
  set status = case when p_attending then 'attending' else 'declined' end,
      answers = coalesce(p_answers, '{}'::jsonb)
  where guest_id = v_guest_id;

  return jsonb_build_object('guest_id', v_guest_id, 'status', case when p_attending then 'attending' else 'declined' end);
end;
$$;

revoke execute on function public.submit_public_rsvp(text, text, text, boolean, integer, jsonb) from public, authenticated;
grant execute on function public.submit_public_rsvp(text, text, text, boolean, integer, jsonb) to anon, authenticated;
