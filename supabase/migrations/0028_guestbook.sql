create table public.guestbook_messages (
  id            uuid primary key default gen_random_uuid(),
  business_id   uuid not null references public.businesses (id),
  event_id      uuid not null references public.events (id) on delete cascade,
  guest_name    text not null,
  message       text not null,
  approved      boolean not null default false,
  created_at    timestamptz not null default now()
);
create index on public.guestbook_messages (event_id, approved);

alter table public.guestbook_messages enable row level security;

create policy "members manage guestbook messages" on public.guestbook_messages
  for all using (public.is_business_member(business_id))
  with check (public.is_business_member(business_id));

-- A guest signing a published Romance invite's guestbook. Runs as anon —
-- same pattern as submit_public_rsvp. New messages default to unapproved;
-- they don't show publicly until a business member approves them.
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
  select * into v_invite from public.invites where public_slug = p_slug and status = 'published';
  if v_invite is null then
    raise exception 'invite not found';
  end if;
  if v_invite.event_id is null then
    raise exception 'this invite is not yet accepting messages';
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

  insert into public.guestbook_messages (business_id, event_id, guest_name, message)
  values (v_invite.business_id, v_invite.event_id, trim(p_name), trim(p_message))
  returning id into v_id;

  return jsonb_build_object('id', v_id);
end;
$$;

revoke execute on function public.submit_guestbook_message(text, text, text) from public, authenticated;
grant execute on function public.submit_guestbook_message(text, text, text) to anon;

-- Public read of only the approved messages for a published invite.
create or replace function public.get_approved_guestbook_messages(p_slug text)
returns jsonb
language sql stable security definer set search_path = public
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'guest_name', gm.guest_name, 'message', gm.message, 'created_at', gm.created_at
  ) order by gm.created_at desc), '[]'::jsonb)
  from public.guestbook_messages gm
  join public.invites i on i.event_id = gm.event_id
  where i.public_slug = p_slug and i.status = 'published' and gm.approved = true
$$;

revoke execute on function public.get_approved_guestbook_messages(text) from public, authenticated;
grant execute on function public.get_approved_guestbook_messages(text) to anon;