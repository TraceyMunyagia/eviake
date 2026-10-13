-- The invite-media bucket and its member-only upload/update/delete policies already exist (0023).
-- This adds a size cap and the allowed file types. Audio stays allowed for the invite music player.
-- The bucket is public so published invites can show media without a login; files sit at
-- unguessable {business_id}/{invite_id}/{slot}-{uuid}.{ext} paths.
update storage.buckets
set public = true,
    file_size_limit = 26214400, -- 25 MB
    allowed_mime_types = array[
      'image/jpeg', 'image/png', 'image/webp', 'image/avif',
      'video/mp4', 'video/webm',
      'audio/mpeg', 'audio/mp4', 'audio/x-m4a', 'audio/aac', 'audio/ogg', 'audio/wav'
    ]
where id = 'invite-media';
