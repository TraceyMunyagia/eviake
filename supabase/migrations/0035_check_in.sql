-- Check-in is business-authenticated, not public — it's the host/door staff
-- using the dashboard, not a guest-facing action.
create or replace function public.check_in_guest_by_token(p_token text)
returns jsonb
language plpgsql
security definer set search_path = public
as $$
declare
  v_guest record;
begin
  select * into v_guest from public.guests where check_in_token = p_token;
  if v_guest is null then
    raise exception 'pass not found';
  end if;
  if not public.is_business_member(v_guest.business_id) then
    raise exception 'not authorized';
  end if;
  if v_guest.checked_in_at is not null then
    raise exception 'already checked in at %', to_char(v_guest.checked_in_at, 'HH24:MI');
  end if;

  update public.guests set checked_in_at = now() where id = v_guest.id;

  return jsonb_build_object(
    'guest_name', v_guest.name,
    'party_size', 1 + v_guest.plus_ones,
    'checked_in_at', now()
  );
end;
$$;

revoke execute on function public.check_in_guest_by_token(text) from public, anon;
grant execute on function public.check_in_guest_by_token(text) to authenticated;

-- Same logic, looked up by guest id instead of token — used by the manual
-- name-search fallback when scanning isn't practical.
create or replace function public.check_in_guest_by_id(p_guest_id uuid)
returns jsonb
language plpgsql
security definer set search_path = public
as $$
declare
  v_guest record;
begin
  select * into v_guest from public.guests where id = p_guest_id;
  if v_guest is null then
    raise exception 'guest not found';
  end if;
  if not public.is_business_member(v_guest.business_id) then
    raise exception 'not authorized';
  end if;
  if v_guest.checked_in_at is not null then
    raise exception 'already checked in at %', to_char(v_guest.checked_in_at, 'HH24:MI');
  end if;

  update public.guests set checked_in_at = now() where id = v_guest.id;

  return jsonb_build_object(
    'guest_name', v_guest.name,
    'party_size', 1 + v_guest.plus_ones,
    'checked_in_at', now()
  );
end;
$$;

revoke execute on function public.check_in_guest_by_id(uuid) from public, anon;
grant execute on function public.check_in_guest_by_id(uuid) to authenticated;