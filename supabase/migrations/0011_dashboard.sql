create or replace function public.notify_order_stage()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare lbl text; tn text;
begin
  if new.status is distinct from old.status then
    select label, tone into lbl, tn
    from public.order_statuses
    where business_id = new.business_id and key = new.status;

    if tn in ('review', 'live') then
      insert into public.notifications (business_id, kind, title, link)
      values (new.business_id, 'order_stage',
              'Order #' || lpad(new.order_no::text, 4, '0') || ' moved to ' || lbl,
              '/orders/' || new.id);
    end if;
  end if;
  return null;
end;
$$;

create trigger orders_stage_notify
  after update of status on public.orders
  for each row execute function public.notify_order_stage();

create or replace function public.notify_revision_requested()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare n bigint;
begin
  select order_no into n from public.orders where id = new.order_id;
  insert into public.notifications (business_id, kind, title, body, link)
  values (new.business_id, 'revision_requested',
          'Revision requested on order #' || lpad(n::text, 4, '0'),
          new.title,
          '/orders/' || new.order_id || '?tab=revisions');
  return null;
end;
$$;

create trigger revisions_notify
  after insert on public.revisions
  for each row execute function public.notify_revision_requested();

create or replace function public.dashboard_overview(p_business_id uuid)
returns jsonb
language plpgsql stable
as $$
begin
  if not public.is_business_member(p_business_id) then
    return null;
  end if;

  return jsonb_build_object(
    'pipeline', coalesce((
      select jsonb_agg(jsonb_build_object(
        'key', s.key,
        'label', s.label,
        'tone', s.tone,
        'count', (select count(*) from public.orders o
                  where o.business_id = s.business_id and o.status = s.key)
      ) order by s.sort_order)
      from public.order_statuses s
      where s.business_id = p_business_id
    ), '[]'::jsonb),
    'pending_quotes', (
      select count(*) from public.quotes q
      where q.business_id = p_business_id and q.status = 'sent'
    ),
    'revenue_month', coalesce((
      select sum(p.amount_kes) from public.payments p
      where p.business_id = dashboard_overview.p_business_id
        and p.paid_at >= (date_trunc('month', now() at time zone 'Africa/Nairobi') at time zone 'Africa/Nairobi')
    ), 0),
    'outstanding', coalesce((
      select sum(greatest(o.total_kes - coalesce(
        (select sum(p.amount_kes) from public.payments p where p.order_id = o.id), 0), 0))
      from public.orders o
      where o.business_id = dashboard_overview.p_business_id and o.payment_status <> 'paid'
    ), 0)
  );
end;
$$;

revoke execute on function public.dashboard_overview(uuid) from public, anon;
grant execute on function public.dashboard_overview(uuid) to authenticated;
