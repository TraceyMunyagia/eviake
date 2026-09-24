create extension if not exists pg_cron;

create or replace function public.check_hosting_renewals()
returns void
language plpgsql
security definer set search_path = public
as $$
declare r record; today date := (now() at time zone 'Africa/Nairobi')::date; days int;
begin
  for r in
    select dh.order_id, dh.business_id, dh.domain
    from public.domains_hosting dh
    where dh.domain_expiry is not null
  loop
    select (dh.domain_expiry - today) into days from public.domains_hosting dh where dh.order_id = r.order_id;
    if days in (30, 14, 7, 1, 0) then
      insert into public.notifications (business_id, kind, title, link)
      values (r.business_id, 'domain_expiry',
              coalesce(r.domain, 'Domain') || ' expires ' ||
              case when days = 0 then 'today' else 'in ' || days || ' day' || case when days = 1 then '' else 's' end end,
              '/orders/' || r.order_id || '?tab=hosting');
    end if;
  end loop;

  for r in
    select dh.order_id, dh.business_id, dh.hosting_provider
    from public.domains_hosting dh
    where dh.hosting_renewal is not null
  loop
    select (dh.hosting_renewal - today) into days from public.domains_hosting dh where dh.order_id = r.order_id;
    if days in (30, 14, 7, 1, 0) then
      insert into public.notifications (business_id, kind, title, link)
      values (r.business_id, 'hosting_renewal',
              coalesce(r.hosting_provider, 'Hosting') || ' renews ' ||
              case when days = 0 then 'today' else 'in ' || days || ' day' || case when days = 1 then '' else 's' end end,
              '/orders/' || r.order_id || '?tab=hosting');
    end if;
  end loop;
end;
$$;

revoke execute on function public.check_hosting_renewals() from public, anon, authenticated;

select cron.schedule('hosting-renewal-check', '0 6 * * *', $$select public.check_hosting_renewals();$$);