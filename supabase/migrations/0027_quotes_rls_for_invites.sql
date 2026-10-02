-- Quotes and quote items are available to members of either Evia business.
drop policy if exists "members manage quotes" on public.quotes;
create policy "members manage quotes" on public.quotes
  for all using (public.is_business_member(business_id))
  with check (public.is_business_member(business_id));

drop policy if exists "members manage quote items" on public.quote_items;
create policy "members manage quote items" on public.quote_items
  for all using (public.is_business_member(business_id))
  with check (public.is_business_member(business_id));
