create extension if not exists pgcrypto;

alter table public.guests
  add column if not exists check_in_token text,
  add column if not exists checked_in_at timestamptz;

-- Backfill any guest rows created before this migration so every guest —
-- past or future — has a valid pass.
update public.guests
set check_in_token = encode(gen_random_bytes(16), 'hex')
where check_in_token is null;

alter table public.guests alter column check_in_token set default encode(gen_random_bytes(16), 'hex');
alter table public.guests alter column check_in_token set not null;
alter table public.guests add constraint guests_check_in_token_key unique (check_in_token);

create index on public.guests (check_in_token);

-- Public read of one guest's pass, by their unguessable token. No business
-- data beyond what's needed to render the pass is exposed. Also returns the
-- invite's template/tokens so the pass page can theme itself to match.
create or replace function public.get_guest_pass(p_token text)
returns jsonb
language plpgsql
stable
security definer set search_path = public
as $$
declare
  v_guest  record;
  v_event  record;
  v_invite record;
begin
  select * into v_guest from public.guests where check_in_token = p_token;
  if v_guest is null then
    return null;
  end if;

  select * into v_event from public.events where id = v_guest.event_id;
  select template, tokens into v_invite
  from public.invites where event_id = v_guest.event_id and status = 'published' limit 1;

  return jsonb_build_object(
    'guest_name', v_guest.name,
    'party_size', 1 + v_guest.plus_ones,
    'checked_in_at', v_guest.checked_in_at,
    'event_name', v_event.name,
    'event_date', v_event.event_date,
    'venue', v_event.venue,
    'template', coalesce(v_invite.template, 'editorial'),
    'tokens', coalesce(v_invite.tokens, '{}'::jsonb)
  );
end;
$$;

revoke execute on function public.get_guest_pass(text) from public, authenticated;
grant execute on function public.get_guest_pass(text) to anon;