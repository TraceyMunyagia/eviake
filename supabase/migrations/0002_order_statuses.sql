create table public.order_statuses (
  business_id  uuid not null references public.businesses (id),
  key          text not null,
  label        text not null,
  tone         text not null default 'neutral'
               check (tone in ('pending', 'progress', 'review', 'live', 'overdue', 'neutral')),
  sort_order   int not null,
  primary key (business_id, key)
);

alter table public.order_statuses enable row level security;

create policy "members read statuses" on public.order_statuses
  for select using (public.is_business_member(business_id));

insert into public.order_statuses (business_id, key, label, tone, sort_order)
select b.id, v.key, v.label, v.tone, v.sort_order
from public.businesses b
join (values
  ('new',          'New order',    'pending',  1),
  ('consultation', 'Consultation', 'pending',  2),
  ('quote',        'Quote',        'pending',  3),
  ('accepted',     'Accepted',     'progress', 4),
  ('paid',         'Paid',         'progress', 5),
  ('development',  'Development',  'progress', 6),
  ('review',       'Review',       'review',   7),
  ('live',         'Live',         'live',     8)
) as v(key, label, tone, sort_order) on b.slug = 'evia_web';

insert into public.order_statuses (business_id, key, label, tone, sort_order)
select b.id, v.key, v.label, v.tone, v.sort_order
from public.businesses b
join (values
  ('payment_pending',    'Payment pending',    'pending',  1),
  ('details_received',   'Details received',   'pending',  2),
  ('designing',          'Designing',          'progress', 3),
  ('preview_sent',       'Preview sent',       'review',   4),
  ('revision_requested', 'Revision requested', 'review',   5),
  ('awaiting_approval',  'Awaiting approval',  'review',   6),
  ('approved',           'Approved',           'progress', 7),
  ('published',          'Published',          'live',     8),
  ('completed',          'Completed',          'live',     9)
) as v(key, label, tone, sort_order) on b.slug = 'evia_invites';

alter table public.orders alter column status drop default;

alter table public.orders
  add constraint orders_status_fkey
  foreign key (business_id, status)
  references public.order_statuses (business_id, key);