insert into storage.buckets (id, name, public)
values ('invite-media', 'invite-media', true)
on conflict (id) do update set public = true;

create policy "invite media is publicly readable"
on storage.objects for select
using (bucket_id = 'invite-media');

create policy "members can upload invite media"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'invite-media'
  and public.is_business_member(((storage.foldername(name))[1])::uuid)
);

create policy "members can update invite media"
on storage.objects for update
to authenticated
using (
  bucket_id = 'invite-media'
  and public.is_business_member(((storage.foldername(name))[1])::uuid)
)
with check (
  bucket_id = 'invite-media'
  and public.is_business_member(((storage.foldername(name))[1])::uuid)
);

create policy "members can delete invite media"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'invite-media'
  and public.is_business_member(((storage.foldername(name))[1])::uuid)
);
