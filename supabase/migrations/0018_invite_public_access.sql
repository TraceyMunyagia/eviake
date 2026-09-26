create or replace function public.get_public_invite(p_slug text)
returns jsonb
language sql stable security definer set search_path = public
as $$
  select jsonb_build_object(
    'template', template, 'package', package, 'content', content,
    'tokens', tokens, 'sections', sections, 'status', status
  )
  from public.invites
  where public_slug = p_slug and status = 'published'
$$;

revoke execute on function public.get_public_invite(text) from public;
grant execute on function public.get_public_invite(text) to anon, authenticated;

create or replace function public.get_invite_by_rsvp_token(p_token text)
returns jsonb
language sql stable security definer set search_path = public
as $$
  select jsonb_build_object('id', id, 'content', content, 'event_id', event_id)
  from public.invites
  where rsvp_track_token = p_token and status = 'published'
$$;

revoke execute on function public.get_invite_by_rsvp_token(text) from public;
grant execute on function public.get_invite_by_rsvp_token(text) to anon, authenticated;