-- Store the public invitation submission that created an order and its full brief.
alter table public.orders
  add column if not exists source_request_id uuid,
  add column if not exists invitation_details jsonb;

create unique index if not exists orders_source_request_id_idx
  on public.orders (source_request_id)
  where source_request_id is not null;

create or replace function public.submit_invitation(
  p_source_request_id uuid,
  p_name text,
  p_email text,
  p_phone text,
  p_package text,
  p_event_date date,
  p_notes text,
  p_details jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_business_id uuid;
  v_client_id uuid;
  v_order_id uuid;
  v_total numeric(12, 2);
begin
  if nullif(trim(p_name), '') is null
    or nullif(trim(p_email), '') is null
    or nullif(trim(p_phone), '') is null
    or nullif(trim(p_package), '') is null
    or p_event_date is null then
    raise exception 'Name, email, phone, package and event date are required';
  end if;

  if p_package not in ('Essential', 'Signature', 'Experience') then
    raise exception 'Invalid invitation package';
  end if;

  select id into v_business_id from public.businesses where slug = 'evia_invites';
  if v_business_id is null then raise exception 'Evia Invites business is not configured'; end if;

  select id into v_order_id from public.orders where source_request_id = p_source_request_id;
  if v_order_id is not null then return v_order_id; end if;

  v_total := case p_package when 'Essential' then 2000 when 'Signature' then 3500 when 'Experience' then 6000 end;

  insert into public.clients (business_id, name, email, phone, notes)
  values (v_business_id, trim(p_name), lower(trim(p_email)), trim(p_phone),
    'Invitation request: ' || coalesce(p_details ->> 'eventName', 'Untitled event'))
  returning id into v_client_id;

  insert into public.orders (
    business_id, client_id, status, package, total_kes, deadline, notes,
    source_request_id, invitation_details
  ) values (
    v_business_id, v_client_id, 'payment_pending', trim(p_package), v_total,
    p_event_date, p_notes, p_source_request_id, p_details
  ) returning id into v_order_id;

  return v_order_id;
end;
$$;

revoke all on function public.submit_invitation(uuid, text, text, text, text, date, text, jsonb) from public;
grant execute on function public.submit_invitation(uuid, text, text, text, text, date, text, jsonb) to anon, authenticated;
