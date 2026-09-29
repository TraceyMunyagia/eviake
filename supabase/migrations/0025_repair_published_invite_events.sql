do $$
declare
  v_invite record;
  v_event_id uuid;
begin
  for v_invite in
    select i.id, i.business_id, i.order_id, i.content, o.client_id
    from public.invites i
    join public.orders o on o.id = i.order_id and o.business_id = i.business_id
    where i.status = 'published' and i.event_id is null
  loop
    insert into public.events (business_id, order_id, client_id, name, event_date)
    values (
      v_invite.business_id,
      v_invite.order_id,
      v_invite.client_id,
      coalesce(v_invite.content->>'couple_names', v_invite.content->>'event_name', 'Invitation'),
      nullif(v_invite.content->>'event_date', '')::date
    )
    returning id into v_event_id;

    update public.invites
    set event_id = v_event_id
    where id = v_invite.id;
  end loop;
end;
$$;
