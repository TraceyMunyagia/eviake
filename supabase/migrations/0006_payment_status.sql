create or replace function public.payment_status_for(paid numeric, total numeric)
returns text
language sql immutable
as $$
  select case
    when paid <= 0 then 'unpaid'
    when paid >= total then 'paid'
    else 'partial'
  end;
$$;

create or replace function public.sync_order_payment_status()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  oid   uuid := coalesce(new.order_id, old.order_id);
  paid  numeric;
  total numeric;
begin
  select coalesce(sum(amount_kes), 0) into paid from public.payments where order_id = oid;
  select total_kes into total from public.orders where id = oid;
  if total is not null then
    update public.orders set payment_status = public.payment_status_for(paid, total) where id = oid;
  end if;
  return null;
end;
$$;

create trigger payments_sync_status
  after insert or update or delete on public.payments
  for each row execute function public.sync_order_payment_status();

create or replace function public.refresh_status_on_total_change()
returns trigger
language plpgsql
as $$
declare paid numeric;
begin
  select coalesce(sum(amount_kes), 0) into paid from public.payments where order_id = new.id;
  new.payment_status := public.payment_status_for(paid, new.total_kes);
  return new;
end;
$$;

create trigger orders_total_changed
  before update of total_kes on public.orders
  for each row execute function public.refresh_status_on_total_change();

update public.orders o
set payment_status = public.payment_status_for(
  coalesce((select sum(amount_kes) from public.payments p where p.order_id = o.id), 0),
  o.total_kes
);