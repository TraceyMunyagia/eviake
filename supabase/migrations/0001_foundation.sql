-- Evia Admin: Week 1 foundation

create extension if not exists pgcrypto;

-- ---------- Businesses ----------
create table public.businesses (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique check (slug in ('evia_web', 'evia_invites')),
  name        text not null,
  created_at  timestamptz not null default now()
);

insert into public.businesses (slug, name) values
  ('evia_web', 'Evia Web'),
  ('evia_invites', 'Evia Invites');

-- ---------- Profiles (one per auth user) ----------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  created_at  timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Which user can see which business ----------
create table public.business_members (
  user_id      uuid not null references auth.users (id) on delete cascade,
  business_id  uuid not null references public.businesses (id) on delete cascade,
  role         text not null default 'staff' check (role in ('owner', 'staff')),
  created_at   timestamptz not null default now(),
  primary key (user_id, business_id)
);

create or replace function public.is_business_member(bid uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.business_members
    where user_id = auth.uid() and business_id = bid
  );
$$;

-- ---------- Shared helper ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- Clients ----------
create table public.clients (
  id            uuid primary key default gen_random_uuid(),
  business_id   uuid not null references public.businesses (id),
  name          text not null,
  business_name text,
  email         text,
  phone         text,
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (id, business_id)
);
create index on public.clients (business_id);
create trigger clients_updated before update on public.clients
  for each row execute function public.set_updated_at();

-- ---------- Orders ----------
create table public.orders (
  id             uuid primary key default gen_random_uuid(),
  order_no       bigint generated always as identity,
  business_id    uuid not null references public.businesses (id),
  client_id      uuid not null,
  status         text not null default 'new',
  payment_status text not null default 'unpaid'
                 check (payment_status in ('unpaid', 'partial', 'paid')),
  package        text,
  total_kes      numeric(12, 2) not null default 0,
  deadline       date,
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (id, business_id),
  -- an order can only point at a client from the same business
  foreign key (client_id, business_id) references public.clients (id, business_id)
);
create index on public.orders (business_id, status);
create trigger orders_updated before update on public.orders
  for each row execute function public.set_updated_at();

-- ---------- Payments ----------
create table public.payments (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid not null references public.businesses (id),
  order_id     uuid not null,
  amount_kes   numeric(12, 2) not null check (amount_kes > 0),
  method       text check (method in ('mpesa', 'bank', 'cash', 'other')),
  reference    text,
  paid_at      timestamptz not null default now(),
  created_at   timestamptz not null default now(),
  -- a payment can only point at an order from the same business
  foreign key (order_id, business_id) references public.orders (id, business_id)
);
create index on public.payments (business_id, order_id);

-- ---------- Row Level Security ----------
alter table public.businesses        enable row level security;
alter table public.profiles          enable row level security;
alter table public.business_members  enable row level security;
alter table public.clients           enable row level security;
alter table public.orders            enable row level security;
alter table public.payments          enable row level security;

create policy "members read their businesses" on public.businesses
  for select using (public.is_business_member(id));

create policy "read own profile" on public.profiles
  for select using (id = auth.uid());
create policy "update own profile" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

create policy "read own memberships" on public.business_members
  for select using (user_id = auth.uid());

create policy "members manage clients" on public.clients
  for all using (public.is_business_member(business_id))
  with check (public.is_business_member(business_id));

create policy "members manage orders" on public.orders
  for all using (public.is_business_member(business_id))
  with check (public.is_business_member(business_id));

create policy "members manage payments" on public.payments
  for all using (public.is_business_member(business_id))
  with check (public.is_business_member(business_id));