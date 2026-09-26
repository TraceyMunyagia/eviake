create table public.invite_templates (
  key               text primary key,
  label             text not null,
  description       text,
  sample_image_url  text,
  sort_order        int not null default 0
);

insert into public.invite_templates (key, label, description, sort_order) values
  ('editorial',   'Editorial',   'Clean, typography-led layout for modern weddings and launches.', 1),
  ('romance',     'Romance',     'Soft, ornamental styling for romantic weddings and engagements.', 2),
  ('celebration', 'Celebration', 'Bold, colourful layout for birthdays and milestone parties.', 3);

create table public.invites (
  id                 uuid primary key default gen_random_uuid(),
  business_id        uuid not null references public.businesses (id),
  order_id           uuid not null,
  event_id           uuid references public.events (id) on delete set null,
  template           text not null references public.invite_templates (key),
  package            text not null check (package in ('essential', 'signature', 'experience')),
  content            jsonb not null default '{}'::jsonb,
  tokens             jsonb not null default '{}'::jsonb,
  sections           jsonb not null default '{}'::jsonb,
  status             text not null default 'draft' check (status in ('draft', 'published')),
  public_slug        text unique,
  rsvp_track_token   text unique,
  published_at       timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  unique (order_id),
  foreign key (order_id, business_id) references public.orders (id, business_id) on delete cascade
);

create trigger invites_updated before update on public.invites
  for each row execute function public.set_updated_at();

create index on public.invites (business_id, status);

alter table public.invite_templates enable row level security;
alter table public.invites enable row level security;

create policy "signed-in users can read templates" on public.invite_templates
  for select using (auth.role() = 'authenticated');

create policy "members manage invites" on public.invites
  for all using (public.is_business_member(business_id))
  with check (public.is_business_member(business_id));