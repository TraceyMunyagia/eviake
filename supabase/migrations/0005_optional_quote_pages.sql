-- Page details are no longer collected by the public quote form.
create or replace function public.submit_quote(
  p_name text,
  p_business_name text,
  p_email text,
  p_phone text,
  p_category text,
  p_description text,
  p_package text,
  p_pages text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_business_id uuid;
  v_client_id uuid;
  v_order_id uuid;
  v_package text := nullif(trim(p_package), '');
  v_pages text := nullif(trim(p_pages), '');
  v_notes text := format('Category: %s\nDescription: %s', trim(p_category), trim(p_description));
begin
  if nullif(trim(p_name), '') is null
    or nullif(trim(p_email), '') is null
    or nullif(trim(p_phone), '') is null
    or nullif(trim(p_business_name), '') is null
    or nullif(trim(p_category), '') is null
    or nullif(trim(p_description), '') is null then
    raise exception 'All quote fields are required';
  end if;

  if v_pages is not null then
    v_notes := v_notes || format('\nPages: %s', v_pages);
  end if;

  if v_package is not null and v_package not in ('starter', 'growth', 'premium', 'unsure') then
    raise exception 'Invalid package';
  end if;

  select id into v_business_id from public.businesses where slug = 'evia_web';
  if v_business_id is null then
    raise exception 'Evia Web business is not configured';
  end if;

  insert into public.clients (business_id, name, business_name, email, phone, notes)
  values (v_business_id, trim(p_name), trim(p_business_name), lower(trim(p_email)), trim(p_phone), v_notes)
  returning id into v_client_id;

  insert into public.orders (business_id, client_id, status, package, notes)
  values (v_business_id, v_client_id, 'quote', v_package,
    'Quote submitted from eviaweb.com. ' || replace(v_notes, E'\n', ' '))
  returning id into v_order_id;

  return v_order_id;
end;
$$;

revoke all on function public.submit_quote(text, text, text, text, text, text, text, text) from public;
grant execute on function public.submit_quote(text, text, text, text, text, text, text, text) to anon, authenticated;
