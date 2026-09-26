alter table public.businesses
  add column if not exists display_name text,
  add column if not exists support_email text,
  add column if not exists support_phone text;

create table public.membership_invites (
  id            uuid primary key default gen_random_uuid(),
  business_id   uuid not null references public.businesses (id),
  email         text not null,
  role          text not null default 'member' check (role in ('owner', 'member')),
  invited_by    uuid references auth.users (id),
  token         text not null unique,
  accepted_at   timestamptz,
  created_at    timestamptz not null default now(),
  unique (business_id, email)
);

alter table public.membership_invites enable row level security;

create policy "members manage invites for their business" on public.membership_invites
  for all using (public.is_business_member(business_id))
  with check (public.is_business_member(business_id));

-- Memberships are stored in public.business_members, which already has its
-- owner/staff role column from 0001_foundation.sql.
