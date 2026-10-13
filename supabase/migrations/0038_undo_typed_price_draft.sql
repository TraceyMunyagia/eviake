-- Undo the earlier draft 0038_typed_price_and_order_fields.sql, which was applied by hand.
-- Its accept trigger wrote to orders.total_amount, which does not exist, so accepting any quote failed.
-- Accepting a quote already sets orders.total_kes through quote_status_effects (0008).
drop trigger if exists trg_quote_accept_sets_total on public.quotes;
drop function if exists public.sync_order_total_from_quote();

-- Typed prices are stored on the package line in quote_items, so these columns were never used.
alter table public.quotes
  drop column if exists setup_price,
  drop column if exists monthly_fee,
  drop column if exists price_note;

-- Invite event details live in orders.invitation_details (0009). orders.package predates the draft and stays.
alter table public.orders drop constraint if exists orders_template_check;
alter table public.orders
  drop column if exists event_type,
  drop column if exists event_date,
  drop column if exists template;
