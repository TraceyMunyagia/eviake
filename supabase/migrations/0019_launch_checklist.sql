create table public.launch_checklist_items (
  business_id  uuid not null references public.businesses (id),
  item_key     text not null,
  done         boolean not null default false,
  done_by      uuid references auth.users (id),
  done_at      timestamptz,
  updated_at   timestamptz not null default now(),
  primary key (business_id, item_key)
);

create trigger launch_checklist_updated before update on public.launch_checklist_items
  for each row execute function public.set_updated_at();

alter table public.launch_checklist_items enable row level security;

create policy "members manage launch checklist" on public.launch_checklist_items
  for all using (public.is_business_member(business_id))
  with check (public.is_business_member(business_id));