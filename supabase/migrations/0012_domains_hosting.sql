create table public.domains_hosting (
  order_id            uuid primary key,
  business_id         uuid not null references public.businesses (id),
  domain              text,
  domain_provider     text,
  domain_expiry       date,
  hosting_provider    text,
  hosting_plan        text,
  hosting_renewal     date,
  ssl_status          text not null default 'unknown'
                       check (ssl_status in ('unknown', 'active', 'expiring', 'expired', 'none')),
  notes               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  foreign key (order_id, business_id) references public.orders (id, business_id) on delete cascade
);

create trigger domains_hosting_updated before update on public.domains_hosting
  for each row execute function public.set_updated_at();

create index on public.domains_hosting (business_id, domain_expiry);
create index on public.domains_hosting (business_id, hosting_renewal);

alter table public.domains_hosting enable row level security;

create policy "members manage domains hosting" on public.domains_hosting
  for all using (public.is_business_member(business_id))
  with check (public.is_business_member(business_id));