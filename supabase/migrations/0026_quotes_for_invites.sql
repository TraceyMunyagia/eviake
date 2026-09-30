-- Quotations are shared by both Evia businesses.
drop policy if exists "members manage quote items" on public.quote_items;
create policy "members manage quote items" on public.quote_items
  for all using (public.is_business_member(business_id))
  with check (public.is_business_member(business_id));

-- Keep the public/PDF document aware of which business owns the quote.
create or replace function public.build_quote_json(qid uuid)
returns jsonb
language sql stable security definer set search_path = public
as $$
  select jsonb_build_object(
    'quote_no', q.quote_no,
    'status', q.status,
    'valid_until', q.valid_until,
    'created_at', q.created_at,
    'sent_at', q.sent_at,
    'subtotal_kes', q.subtotal_kes,
    'discount_kes', q.discount_kes,
    'total_kes', q.total_kes,
    'care_name', q.care_name,
    'monthly_kes', q.monthly_kes,
    'notes', q.notes,
    'business_name', b.name,
    'business_slug', b.slug,
    'client_name', c.name,
    'client_business_name', c.business_name,
    'items', coalesce((
      select jsonb_agg(jsonb_build_object(
        'kind', i.kind,
        'name', i.name,
        'description', i.description,
        'quantity', i.quantity,
        'unit_price_kes', i.unit_price_kes
      ) order by i.sort_order)
      from public.quote_items i where i.quote_id = q.id
    ), '[]'::jsonb)
  )
  from public.quotes q
  join public.businesses b on b.id = q.business_id
  join public.clients c on c.id = q.client_id
  where q.id = qid;
$$;

revoke execute on function public.build_quote_json(uuid) from public, anon, authenticated;

