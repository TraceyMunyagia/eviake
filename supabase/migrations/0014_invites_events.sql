create table public.events (
  id            uuid primary key default gen_random_uuid(),
  business_id   uuid not null references public.businesses (id),
  order_id      uuid,
  client_id     uuid not null references public.clients (id),
  name          text not null,
  event_type    text,
  event_date    date,
  venue         text,
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  foreign key (order_id, business_id) references public.orders (id, business_id) on delete set null
);
create trigger events_updated before update on public.events
  for each row execute function public.set_updated_at();
create index on public.events (business_id, event_date);

create table public.guests (
  id            uuid primary key default gen_random_uuid(),
  business_id   uuid not null references public.businesses (id),
  event_id      uuid not null references public.events (id) on delete cascade,
  name          text not null,
  phone         text,
  email         text,
  group_name    text,
  plus_ones     int not null default 0 check (plus_ones >= 0),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create trigger guests_updated before update on public.guests
  for each row execute function public.set_updated_at();
create index on public.guests (event_id);

create table public.rsvps (
  guest_id      uuid primary key references public.guests (id) on delete cascade,
  business_id   uuid not null references public.businesses (id),
  status        text not null default 'pending'
                check (status in ('pending', 'attending', 'declined')),
  party_size    int,
  responded_at  timestamptz,
  notes         text,
  updated_at    timestamptz not null default now()
);
create trigger rsvps_updated before update on public.rsvps
  for each row execute function public.set_updated_at();

create or replace function public.rsvp_before_write()
returns trigger language plpgsql as $$
begin
  if new.status is distinct from 'pending' and (tg_op = 'INSERT' or old.status is distinct from new.status) then
    new.responded_at := coalesce(new.responded_at, now());
  end if;
  if new.status = 'pending' then
    new.responded_at := null;
  end if;
  return new;
end;
$$;
create trigger rsvps_before_write before insert or update on public.rsvps
  for each row execute function public.rsvp_before_write();

-- every new guest starts with a pending rsvp row
create or replace function public.guest_after_insert()
returns trigger language plpgsql as $$
begin
  insert into public.rsvps (guest_id, business_id) values (new.id, new.business_id);
  return new;
end;
$$;
create trigger guests_after_insert after insert on public.guests
  for each row execute function public.guest_after_insert();

alter table public.events enable row level security;
alter table public.guests enable row level security;
alter table public.rsvps  enable row level security;

create policy "members manage events" on public.events
  for all using (public.is_business_member(business_id)) with check (public.is_business_member(business_id));
create policy "members manage guests" on public.guests
  for all using (public.is_business_member(business_id)) with check (public.is_business_member(business_id));
create policy "members manage rsvps" on public.rsvps
  for all using (public.is_business_member(business_id)) with check (public.is_business_member(business_id));