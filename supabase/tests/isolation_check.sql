-- Manual RLS verification script — NOT a migration, do not run automatically.
-- Run manually after any change touching RLS policies.

-- SECTION 1: run as an outsider with no business membership.
-- Replace the placeholder below with a real auth.users id that has no rows
-- in `memberships`, then execute this block via the SQL editor.
do $$
declare
  outsider_id uuid := '9b6fdb9d-5057-480b-9f6f-d7472efe37c7';
  dash jsonb;
  web_id uuid := (select id from public.businesses where slug = 'evia_web');
  counts record;
  all_pass boolean := true;
begin
  perform set_config('request.jwt.claims',
    json_build_object('sub', outsider_id, 'role', 'authenticated')::text, true);
  set local role authenticated;

  dash := public.dashboard_overview(web_id);
  if dash is not null then
    raise notice 'FAIL — dashboard_overview returned data for an outsider: %', dash;
    all_pass := false;
  else
    raise notice 'PASS — dashboard_overview returned null for an outsider';
  end if;

  for counts in
    select * from (values
      ('clients',           (select count(*) from public.clients)),
      ('orders',            (select count(*) from public.orders)),
      ('payments',          (select count(*) from public.payments)),
      ('quotes',            (select count(*) from public.quotes)),
      ('price_items',       (select count(*) from public.price_items)),
      ('revisions',         (select count(*) from public.revisions)),
      ('project_details',   (select count(*) from public.project_details)),
      ('project_checklist', (select count(*) from public.project_checklist)),
      ('domains_hosting',   (select count(*) from public.domains_hosting)),
      ('events',            (select count(*) from public.events)),
      ('guests',            (select count(*) from public.guests)),
      ('rsvps',             (select count(*) from public.rsvps)),
      ('notifications',     (select count(*) from public.notifications))
    ) as t(table_name, row_count)
  loop
    if counts.row_count = 0 then
      raise notice 'PASS — % returned 0 rows for an outsider', counts.table_name;
    else
      raise notice 'FAIL — % returned % rows for an outsider', counts.table_name, counts.row_count;
      all_pass := false;
    end if;
  end loop;

  if all_pass then
    raise notice '=== ALL OUTSIDER CHECKS PASSED ===';
  else
    raise notice '=== ONE OR MORE OUTSIDER CHECKS FAILED — see above ===';
  end if;
end $$;

-- SECTION 2: run as a genuine logged-in member of Evia Web (not the outsider).
-- Confirms a real member of one business can't see the other business's rows.
do $$
declare
  inv_id uuid := (select id from public.businesses where slug = 'evia_invites');
  leaked int := 0;
begin
  leaked := leaked + (select count(*) from public.orders  where business_id = inv_id);
  leaked := leaked + (select count(*) from public.clients where business_id = inv_id);
  leaked := leaked + (select count(*) from public.events  where business_id = inv_id);
  leaked := leaked + (select count(*) from public.guests  where business_id = inv_id);
  leaked := leaked + (select count(*) from public.rsvps   where business_id = inv_id);

  if leaked = 0 then
    raise notice 'PASS — no Evia Invites rows visible to an Evia Web member';
  else
    raise notice 'FAIL — % Evia Invites rows visible to an Evia Web member', leaked;
  end if;
end $$;