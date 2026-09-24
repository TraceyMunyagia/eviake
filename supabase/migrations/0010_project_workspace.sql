insert into public.order_statuses (business_id, key, label, tone, sort_order)
select b.id, v.key, v.label, v.tone, v.sort_order
from public.businesses b
join (values
  ('design',    'Design',    'progress', 6),
  ('revisions', 'Revisions', 'review',   9),
  ('qa',        'Final QA',  'review',   10)
) as v(key, label, tone, sort_order) on b.slug = 'evia_web';

update public.order_statuses s
set sort_order = v.sort_order
from public.businesses b,
     (values ('development', 7), ('review', 8), ('live', 11)) as v(key, sort_order)
where s.business_id = b.id and b.slug = 'evia_web' and s.key = v.key;

update public.order_statuses s
set label = 'Client review'
from public.businesses b
where s.business_id = b.id and b.slug = 'evia_web' and s.key = 'review';

alter table public.price_items
  add column included_revisions int not null default 0 check (included_revisions >= 0);

update public.price_items p
set included_revisions = v.n
from public.businesses b,
     (values ('Starter', 1), ('Growth', 2), ('Premium', 4)) as v(name, n)
where p.business_id = b.id and b.slug = 'evia_web' and p.kind = 'package' and p.name = v.name;

create table public.revisions (
  id            uuid primary key default gen_random_uuid(),
  business_id   uuid not null references public.businesses (id),
  order_id      uuid not null,
  request_no    int not null default 0,
  title         text not null,
  description   text,
  status        text not null default 'requested'
                check (status in ('requested', 'in_progress', 'done')),
  requested_on  date not null default current_date,
  completed_on  date,
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (order_id, request_no),
  foreign key (order_id, business_id) references public.orders (id, business_id) on delete cascade
);
create index on public.revisions (business_id, status);

create or replace function public.revision_before_write()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    new.request_no := coalesce(
      (select max(request_no) from public.revisions where order_id = new.order_id), 0) + 1;
  end if;

  if new.status = 'done' then
    if tg_op = 'INSERT' or old.status is distinct from 'done' then
      new.completed_on := coalesce(new.completed_on, current_date);
    end if;
  else
    new.completed_on := null;
  end if;

  new.updated_at := now();
  return new;
end;
$$;

create trigger revisions_before_write
  before insert or update on public.revisions
  for each row execute function public.revision_before_write();

create table public.project_details (
  order_id          uuid primary key,
  business_id       uuid not null references public.businesses (id),
  business_summary  text,
  website_goals     text,
  pages_needed      text,
  reference_sites   text,
  technical_notes   text,
  assets_url        text,
  website_url       text,
  staging_url       text,
  cms               text,
  deployment_notes  text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  foreign key (order_id, business_id) references public.orders (id, business_id) on delete cascade
);
create trigger project_details_updated before update on public.project_details
  for each row execute function public.set_updated_at();

create table public.project_checklist (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid not null references public.businesses (id),
  order_id     uuid not null,
  label        text not null,
  done         boolean not null default false,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now(),
  foreign key (order_id, business_id) references public.orders (id, business_id) on delete cascade
);
create index on public.project_checklist (order_id);

alter table public.revisions          enable row level security;
alter table public.project_details    enable row level security;
alter table public.project_checklist  enable row level security;

create policy "members manage revisions" on public.revisions
  for all using (public.is_business_member(business_id))
  with check (public.is_business_member(business_id));

create policy "members manage project details" on public.project_details
  for all using (public.is_business_member(business_id))
  with check (public.is_business_member(business_id));

create policy "members manage project checklist" on public.project_checklist
  for all using (public.is_business_member(business_id))
  with check (public.is_business_member(business_id));