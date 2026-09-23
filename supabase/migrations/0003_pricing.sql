create table public.price_items (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid not null references public.businesses (id),
  kind         text not null check (kind in ('package', 'addon')),
  name         text not null,
  description  text,
  price_kes    numeric(12, 2) not null default 0 check (price_kes >= 0),
  active       boolean not null default true,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (business_id, kind, name)
);
create index on public.price_items (business_id, kind);
create trigger price_items_updated before update on public.price_items
  for each row execute function public.set_updated_at();

alter table public.price_items enable row level security;

create policy "members manage price items" on public.price_items
  for all using (public.is_business_member(business_id))
  with check (public.is_business_member(business_id));

insert into public.price_items (business_id, kind, name, price_kes, active, sort_order)
select b.id, v.kind, v.name, v.price, v.price > 0, v.sort_order
from public.businesses b
join (values
  ('package', 'Starter',                          0,     10),
  ('package', 'Growth',                           16000, 20),
  ('package', 'Premium',                          0,     30),
  ('addon',   'Extra page',                       0,     10),
  ('addon',   'Advanced WhatsApp flow',           0,     20),
  ('addon',   'Booking / Appointment system',     4000,  30),
  ('addon',   'Product catalogue',                0,     40),
  ('addon',   'Property listings',                0,     50),
  ('addon',   'Blog setup',                       0,     60),
  ('addon',   'Advanced SEO',                     5000,  70),
  ('addon',   'Google Business Profile',          1500,  80),
  ('addon',   'Newsletter / Email signup',        0,     90),
  ('addon',   'Advanced contact / enquiry forms', 0,     100),
  ('addon',   'Gallery / Portfolio',              0,     110),
  ('addon',   'Testimonials / Reviews',           0,     120)
) as v(kind, name, price, sort_order) on b.slug = 'evia_web';

insert into public.price_items (business_id, kind, name, price_kes, active, sort_order)
select b.id, 'package', v.name, 0, false, v.sort_order
from public.businesses b
join (values ('Essential', 10), ('Signature', 20), ('Experience', 30)) as v(name, sort_order)
  on b.slug = 'evia_invites';