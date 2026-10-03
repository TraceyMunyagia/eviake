-- Public invite pages can be opened with an existing Supabase session. In
-- that case PostgREST executes RPCs as authenticated rather than anon.
grant execute on function public.submit_guestbook_message(text, text, text)
  to anon, authenticated;

grant execute on function public.get_approved_guestbook_messages(text)
  to anon, authenticated;
