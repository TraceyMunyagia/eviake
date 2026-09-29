-- Guests answering custom RSVP questions need somewhere to land. One jsonb
-- column keyed by question id is simplest — it mirrors how invites.content
-- already stores rsvp_questions.
alter table public.rsvps
  add column if not exists answers jsonb not null default '{}'::jsonb;

-- Publishing an invite with no linked event creates one, so a guest's RSVP
-- has a real event/guest/rsvp row to attach to, the same shape Evia Invites'
-- existing Events feature already uses.
create or replace function public.ensure_invite_event(p_invite_id uuid)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  v_invite record;
  v_order  record;
  v_event_id uuid;
begin
  select * into v_invite from public.invites where id = p_invite_id;
  if v_invite is null then
    raise exception 'invite not found';
  end if;
  if not public.is_business_member(v_invite.business_id) then
    raise exception 'not authorized';
  end if;
  if v_invite.event_id is not null then
    return v_invite.event_id;
  end if;

  select * into v_order from public.orders where id = v_invite.order_id;

  insert into public.events (business_id, order_id, client_id, name, event_date)
  values (
    v_invite.business_id,
    v_invite.order_id,
    v_order.client_id,
    coalesce(v_invite.content->>'couple_names', v_invite.content->>'event_name', 'Invitation'),
    nullif(v_invite.content->>'event_date', '')::date
  )
  returning id into v_event_id;

  update public.invites set event_id = v_event_id where id = p_invite_id;
  return v_event_id;
end;
$$;

revoke execute on function public.ensure_invite_event(uuid) from public, anon;
grant execute on function public.ensure_invite_event(uuid) to authenticated;

-- A guest submitting a published invite's RSVP form. Runs as anon — no
-- login, matching how a guest actually reaches the page.
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
  returning id into v_guest_id;

  update public.rsvps
  set status = case when p_attending then 'attending' else 'declined' end,
      answers = coalesce(p_answers, '{}'::jsonb)
  where guest_id = v_guest_id;

  return jsonb_build_object('guest_id', v_guest_id, 'status', case when p_attending then 'attending' else 'declined' end);
end;
$$;

revoke execute on function public.submit_public_rsvp(text, text, boolean, int, jsonb) from public, authenticated;
grant execute on function public.submit_public_rsvp(text, text, boolean, int, jsonb) to anon;