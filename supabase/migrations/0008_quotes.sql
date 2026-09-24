alter table public.price_items drop constraint price_items_kind_check;
alter table public.price_items
  add constraint price_items_kind_check check (kind in ('package', 'addon', 'care'));

insert into public.price_items (business_id, kind, name, price_kes, active, sort_order)
select id, 'care', 'Website Care & Hosting', 4000, true, 10
from public.businesses where slug = 'evia_web'
on conflict (business_id, kind, name) do nothing;

do $$
begin
  if to_regclass('public.notifications') is null then
    raise exception 'Migration 0008 requires migration 0007_notifications.sql to be applied first';
  end if;
end;
$$;

create or replace function public.is_web_business(bid uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.businesses where id = bid and slug = 'evia_web');
$$;

create table public.quotes (
  id            uuid primary key default gen_random_uuid(),
  quote_no      bigint generated always as identity,
  business_id   uuid not null references public.businesses (id),
  client_id     uuid not null,
  order_id      uuid,
  status        text not null default 'draft'
                check (status in ('draft', 'sent', 'accepted', 'rejected')),
  public_token  text not null unique
                default replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
  valid_until   date,
  discount_kes  numeric(12, 2) not null default 0 check (discount_kes >= 0),
  care_name     text,
  monthly_kes   numeric(12, 2) not null default 0 check (monthly_kes >= 0),
  subtotal_kes  numeric(12, 2) not null default 0,
  total_kes     numeric(12, 2) generated always as (greatest(subtotal_kes - discount_kes, 0)) stored,
  notes         text,
  sent_at       timestamptz,
  decided_at    timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (id, business_id),
  foreign key (client_id, business_id) references public.clients (id, business_id),
  foreign key (order_id, business_id) references public.orders (id, business_id)
);
create index on public.quotes (business_id, status);
create index on public.quotes (order_id);
create trigger quotes_updated before update on public.quotes
  for each row execute function public.set_updated_at();

create table public.quote_items (
  id              uuid primary key default gen_random_uuid(),
  quote_id        uuid not null,
  business_id     uuid not null references public.businesses (id),
  kind            text not null check (kind in ('package', 'addon', 'custom')),
  name            text not null,
  description     text,
  quantity        int not null default 1 check (quantity > 0),
  unit_price_kes  numeric(12, 2) not null default 0 check (unit_price_kes >= 0),
  sort_order      int not null default 0,
  foreign key (quote_id, business_id) references public.quotes (id, business_id) on delete cascade
);
create index on public.quote_items (quote_id);

alter table public.quotes      enable row level security;
alter table public.quote_items enable row level security;

create policy "members manage quotes" on public.quotes
  for all using (public.is_business_member(business_id))
  with check (public.is_business_member(business_id) and public.is_web_business(business_id));

create policy "members manage quote items" on public.quote_items
  for all using (public.is_business_member(business_id))
  with check (public.is_business_member(business_id) and public.is_web_business(business_id));

create or replace function public.recalc_quote_subtotal()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare qid uuid := coalesce(new.quote_id, old.quote_id);
begin
  update public.quotes
  set subtotal_kes = coalesce(
    (select sum(quantity * unit_price_kes) from public.quote_items where quote_id = qid), 0)
  where id = qid;
  return null;
end;
$$;

create trigger quote_items_recalc
  after insert or update or delete on public.quote_items
  for each row execute function public.recalc_quote_subtotal();

create or replace function public.quote_status_stamps()
returns trigger
language plpgsql
as $$
begin
  if new.status is distinct from old.status then
    if new.status = 'draft' then
      new.sent_at := null;
      new.decided_at := null;
    elsif new.status = 'sent' then
      new.sent_at := coalesce(old.sent_at, now());
      new.decided_at := null;
    else
      new.sent_at := coalesce(old.sent_at, now());
      new.decided_at := now();
    end if;
  end if;
  return new;
end;
$$;

create trigger quotes_status_stamps
  before update of status on public.quotes
  for each row execute function public.quote_status_stamps();

create or replace function public.quote_status_effects()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare pkg text;
begin
  if new.status is not distinct from old.status then
    return null;
  end if;

  if new.order_id is not null then
    if new.status = 'sent' then
      update public.orders set status = 'quote'
      where id = new.order_id and status in ('new', 'consultation');
    elsif new.status = 'accepted' then
      select name into pkg from public.quote_items
      where quote_id = new.id and kind = 'package'
      order by sort_order limit 1;

      update public.orders
      set status = 'accepted', total_kes = new.total_kes, package = coalesce(pkg, package)
      where id = new.order_id and status in ('new', 'consultation', 'quote');
    end if;
  end if;

  if new.status in ('accepted', 'rejected') then
    insert into public.notifications (business_id, kind, title, link)
    values (new.business_id, 'quote_' || new.status,
            'Quote Q-' || lpad(new.quote_no::text, 4, '0') || ' ' || new.status,
            '/quotations/' || new.id);
  end if;

  return null;
end;
$$;

create trigger quotes_status_effects
  after update of status on public.quotes
  for each row execute function public.quote_status_effects();

create or replace function public.save_quote(
  p_quote_id    uuid,
  p_business_id uuid,
  p_client_id   uuid,
  p_order_id    uuid,
  p_discount    numeric,
  p_care_name   text,
  p_monthly     numeric,
  p_valid_until date,
  p_notes       text,
  p_items       jsonb
)
returns uuid
language plpgsql
as $$
declare qid uuid;
begin
  if p_quote_id is null then
    insert into public.quotes
      (business_id, client_id, order_id, discount_kes, care_name, monthly_kes, valid_until, notes)
    values
      (p_business_id, p_client_id, p_order_id, coalesce(p_discount, 0), p_care_name,
       coalesce(p_monthly, 0), p_valid_until, p_notes)
    returning id into qid;
  else
    update public.quotes
    set client_id = p_client_id,
        order_id = p_order_id,
        discount_kes = coalesce(p_discount, 0),
        care_name = p_care_name,
        monthly_kes = coalesce(p_monthly, 0),
        valid_until = p_valid_until,
        notes = p_notes
    where id = p_quote_id and business_id = p_business_id and status = 'draft'
    returning id into qid;

    if qid is null then
      raise exception 'Quote not found, or it is no longer a draft';
    end if;

    delete from public.quote_items where quote_id = qid;
  end if;

  insert into public.quote_items
    (quote_id, business_id, kind, name, description, quantity, unit_price_kes, sort_order)
  select qid, p_business_id,
         i ->> 'kind',
         i ->> 'name',
         nullif(i ->> 'description', ''),
         coalesce((i ->> 'quantity')::int, 1),
         coalesce((i ->> 'unit_price_kes')::numeric, 0),
         (ord * 10)::int
  from jsonb_array_elements(coalesce(p_items, '[]'::jsonb)) with ordinality as t(i, ord);

  return qid;
end;
$$;

create or replace function public.build_quote_json(qid uuid)
returns jsonb
language sql stable security definer set search_path = public
as $$
  select jsonb_build_object(
    'quote_no', q.quote_no,
    'status', q.status,
    'valid_until', q.valid_until,
    'created_at', q.created_at,
    'sent_at', q.sent_at,
    'subtotal_kes', q.subtotal_kes,
    'discount_kes', q.discount_kes,
    'total_kes', q.total_kes,
    'care_name', q.care_name,
    'monthly_kes', q.monthly_kes,
    'notes', q.notes,
    'business_name', b.name,
    'client_name', c.name,
    'client_business_name', c.business_name,
    'items', coalesce((
      select jsonb_agg(jsonb_build_object(
        'kind', i.kind,
        'name', i.name,
        'description', i.description,
        'quantity', i.quantity,
        'unit_price_kes', i.unit_price_kes
      ) order by i.sort_order)
      from public.quote_items i where i.quote_id = q.id
    ), '[]'::jsonb)
  )
  from public.quotes q
  join public.businesses b on b.id = q.business_id
  join public.clients c on c.id = q.client_id
  where q.id = qid;
$$;

revoke execute on function public.build_quote_json(uuid) from public, anon, authenticated;

create or replace function public.get_public_quote(p_token text)
returns jsonb
language sql stable security definer set search_path = public
as $$
  select public.build_quote_json(q.id)
  from public.quotes q
  where q.public_token = p_token and q.status in ('sent', 'accepted', 'rejected');
$$;

revoke execute on function public.get_public_quote(text) from public;
grant execute on function public.get_public_quote(text) to anon, authenticated;

create or replace function public.get_quote_document(p_id uuid)
returns jsonb
language sql stable security definer set search_path = public
as $$
  select public.build_quote_json(q.id)
  from public.quotes q
  where q.id = p_id and public.is_business_member(q.business_id);
$$;

revoke execute on function public.get_quote_document(uuid) from public, anon;
grant execute on function public.get_quote_document(uuid) to authenticated;
