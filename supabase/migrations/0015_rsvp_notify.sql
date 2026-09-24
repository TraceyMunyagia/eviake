create or replace function public.notify_rsvp_response()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare gname text; ename text; eid uuid;
begin
  if new.status is distinct from old.status and new.status <> 'pending' then
    select g.name, e.name, e.id into gname, ename, eid
    from public.guests g join public.events e on e.id = g.event_id
    where g.id = new.guest_id;

    insert into public.notifications (business_id, kind, title, link)
    values (new.business_id, 'rsvp_response',
            gname || ' ' || new.status || ' — ' || ename,
            '/events/' || eid || '?tab=rsvps');
  end if;
  return null;
end;
$$;

create trigger rsvps_notify after update of status on public.rsvps
  for each row execute function public.notify_rsvp_response();