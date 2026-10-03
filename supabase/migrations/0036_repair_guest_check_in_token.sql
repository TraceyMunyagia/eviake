-- Repair environments where the RSVP function was deployed before the guest
-- pass columns. This is intentionally idempotent so it is safe to run after
-- 0031 as well.
create extension if not exists pgcrypto;

alter table public.guests
  add column if not exists check_in_token text,
  add column if not exists checked_in_at timestamptz;

update public.guests
set check_in_token = encode(gen_random_bytes(16), 'hex')
where check_in_token is null;

alter table public.guests alter column check_in_token set default encode(gen_random_bytes(16), 'hex');
alter table public.guests alter column check_in_token set not null;

create unique index if not exists guests_check_in_token_key on public.guests (check_in_token);
create index if not exists guests_check_in_token_idx on public.guests (check_in_token);
