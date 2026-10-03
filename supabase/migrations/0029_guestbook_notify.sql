create or replace function public.notify_guestbook_message()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_event_name text;
  v_invite_id  uuid;
begin
  select e.name into v_event_name from public.events e where e.id = new.event_id;
  select i.id into v_invite_id from public.invites i where i.event_id = new.event_id limit 1;

  insert into public.notifications (business_id, kind, title, link)
  values (
    new.business_id,
    'guestbook_message',
    new.guest_name || ' left a guestbook message on ' || coalesce(v_event_name, 'an invite'),
    case when v_invite_id is not null then '/invites/' || v_invite_id || '?tab=guestbook'
         else '/events/' || new.event_id end
  );
  return null;
end;
$$;

create trigger guestbook_messages_notify after insert on public.guestbook_messages
  for each row execute function public.notify_guestbook_message();