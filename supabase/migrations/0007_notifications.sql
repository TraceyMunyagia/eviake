create table public.notifications (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid not null references public.businesses (id),
  kind         text not null,
  title        text not null,
  body         text,
  link         text,
  read_at      timestamptz,
  created_at   timestamptz not null default now()
);
create index on public.notifications (business_id, created_at desc);

alter table public.notifications enable row level security;

create policy "members manage notifications" on public.notifications
  for all using (public.is_business_member(business_id))
  with check (public.is_business_member(business_id));

create or replace function public.notify_order_created()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.notifications (business_id, kind, title, link)
  values (new.business_id, 'order_created',
          'New order #' || lpad(new.order_no::text, 4, '0'),
          '/orders/' || new.id);
  return null;
end;
$$;

create trigger orders_notify after insert on public.orders
  for each row execute function public.notify_order_created();

create or replace function public.notify_payment_received()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.notifications (business_id, kind, title, body, link)
  values (new.business_id, 'payment_received', 'Payment received',
          'KSh ' || to_char(new.amount_kes, 'FM999,999,999,990'),
          '/orders/' || new.order_id);
  return null;
end;
$$;

create trigger payments_notify after insert on public.payments
  for each row execute function public.notify_payment_received();