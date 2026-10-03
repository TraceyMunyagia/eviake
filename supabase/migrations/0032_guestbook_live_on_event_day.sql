-- Guestbook messages are visible immediately and only open on the event day.
create or replace function public.submit_guestbook_message(
  p_slug text,
  p_name text,
  p_message text
)
returns jsonb
language plpgsql
security definer set search_path = public
as $$
declare
  v_invite record;
  v_id uuid;
begin
  select i.*, e.event_date
    into v_invite
    from public.invites i
    left join public.events e on e.id = i.event_id
   where i.public_slug = p_slug and i.status = 'published';

  if v_invite is null then
    raise exception 'invite not found';
  end if;
  if v_invite.event_id is null then
    raise exception 'this invite is not yet accepting messages';
  end if;
  if v_invite.event_date is null
     or v_invite.event_date <> (now() at time zone 'Africa/Nairobi')::date then
    raise exception 'the guestbook opens on the day of the event';
  end if;
  if p_name is null or length(trim(p_name)) = 0 then
    raise exception 'name is required';
  end if;
  if p_message is null or length(trim(p_message)) = 0 then
    raise exception 'message is required';
  end if;
  if length(p_message) > 500 then
    raise exception 'message is too long (500 characters max)';
  end if;

  insert into public.guestbook_messages (business_id, event_id, guest_name, message, approved)
  values (v_invite.business_id, v_invite.event_id, trim(p_name), trim(p_message), true)
  returning id into v_id;

  return jsonb_build_object('id', v_id);
end;
$$;

create or replace function public.get_approved_guestbook_messages(p_slug text)
returns jsonb
language sql stable security definer set search_path = public
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'guest_name', gm.guest_name, 'message', gm.message, 'created_at', gm.created_at
  ) order by gm.created_at desc), '[]'::jsonb)
  from public.guestbook_messages gm
  join public.invites i on i.event_id = gm.event_id
  join public.events e on e.id = gm.event_id
  where i.public_slug = p_slug
    and i.status = 'published'
    and e.event_date = (now() at time zone 'Africa/Nairobi')::date
$$;

grant execute on function public.submit_guestbook_message(text, text, text) to anon, authenticated;
grant execute on function public.get_approved_guestbook_messages(text) to anon, authenticated;
