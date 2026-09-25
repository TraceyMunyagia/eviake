-- Run against a second, non-member user. Replace the placeholder id.
-- Every count must be 0 and dashboard_overview must return null.
do $$
declare
  web_id uuid := (select id from public.businesses where slug = 'evia_web');
  inv_id uuid := (select id from public.businesses where slug = 'evia_invites');
  dash jsonb;
  n_clients int; n_orders int; n_payments int; n_quotes int; n_price int;
  n_revisions int; n_details int; n_checklist int; n_hosting int;
  n_events int; n_guests int; n_rsvps int; n_notifs int;
begin
  perform set_config('request.jwt.claims',
    json_build_object('sub', 'PASTE-OUTSIDER-USER-ID', 'role', 'authenticated')::text, true);
  set local role authenticated;

  dash := public.dashboard_overview(web_id);
  select count(*) into n_clients   from public.clients;
  select count(*) into n_orders    from public.orders;
  select count(*) into n_payments  from public.payments;
  select count(*) into n_quotes    from public.quotes;
  select count(*) into n_price     from public.price_items;
  select count(*) into n_revisions from public.revisions;
  select count(*) into n_details   from public.project_details;
  select count(*) into n_checklist from public.project_checklist;
  select count(*) into n_hosting   from public.domains_hosting;
  select count(*) into n_events    from public.events;
  select count(*) into n_guests    from public.guests;
  select count(*) into n_rsvps     from public.rsvps;
  select count(*) into n_notifs    from public.notifications;

  raise exception 'dash=% clients=% orders=% payments=% quotes=% price=% revisions=% details=% checklist=% hosting=% events=% guests=% rsvps=% notifs=%',
    dash, n_clients, n_orders, n_payments, n_quotes, n_price, n_revisions, n_details, n_checklist, n_hosting, n_events, n_guests, n_rsvps, n_notifs;
end $$;

-- Second pass: a real member of Evia Web must NOT see Evia Invites rows and vice versa.
-- Run this as an authenticated member of evia_web only.
do $$
declare inv_id uuid := (select id from public.businesses where slug = 'evia_invites');
declare n int;
begin
  select count(*) into n from public.orders where business_id = inv_id;
  select count(*) into n from n + (select count(*) from public.clients where business_id = inv_id);
  select count(*) into n from n + (select count(*) from public.events where business_id = inv_id);
  raise exception 'cross-business rows visible to evia_web member: %', n;
end $$;