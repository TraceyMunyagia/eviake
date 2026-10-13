import { supabase } from '@/lib/supabase'

export const BUCKET = 'invite-media'
const TYPES = {
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
  video: ['video/mp4', 'video/webm'],
  audio: ['audio/mpeg', 'audio/mp4', 'audio/x-m4a', 'audio/aac', 'audio/ogg', 'audio/wav'],
}
export const MAX_IMAGE_BYTES = 15 * 1024 * 1024 // before compression
export const MAX_VIDEO_BYTES = 25 * 1024 * 1024
export const MAX_AUDIO_BYTES = 15 * 1024 * 1024
const MAX_EDGE = 2200

export type MediaKind = keyof typeof TYPES
export const ACCEPT: Record<MediaKind, string> = {
  image: 'image/jpeg,image/png,image/webp,image/avif',
  video: 'video/mp4,video/webm',
  audio: 'audio/*',
}
export class MediaError extends Error {}

export function validateFile(file: File, kind: MediaKind): void {
  if (!TYPES[kind].includes(file.type)) {
    if (/hei[cf]/i.test(file.type) || /\.hei[cf]$/i.test(file.name)) {
      throw new MediaError('HEIC photos are not supported. Export as JPG first (iPhone: Settings → Camera → Formats → Most Compatible).')
    }
    throw new MediaError(kind === 'image' ? 'Use a JPG, PNG or WebP image.' : kind === 'video' ? 'Use an MP4 or WebM video.' : 'Use an MP3, M4A, AAC, OGG or WAV file.')
  }
  const max = kind === 'image' ? MAX_IMAGE_BYTES : kind === 'video' ? MAX_VIDEO_BYTES : MAX_AUDIO_BYTES
  if (file.size > max) throw new MediaError(`${file.name} is too large (max ${Math.round(max / 1024 / 1024)} MB).`)
}

const extOf = (type: string) => (type === 'image/jpeg' ? 'jpg' : type === 'audio/mpeg' ? 'mp3' : type.split('/')[1].replace('x-', ''))

/** Resize to 2200px on the long edge and re-encode as WebP. Never returns something bigger than the original. */
async function compressImage(file: File): Promise<{ blob: Blob; type: string; ext: string }> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
  const w = Math.round(bitmap.width * scale)
  const h = Math.round(bitmap.height * scale)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new MediaError('Could not process the image.')
  ctx.drawImage(bitmap, 0, 0, w, h)
  bitmap.close()
  const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, 'image/webp', 0.82))
  if (!blob) throw new MediaError('Could not process the image.')
  if (scale === 1 && blob.size >= file.size) return { blob: file, type: file.type, ext: extOf(file.type) }
  return { blob, type: 'image/webp', ext: 'webp' }
}

export async function uploadInviteMedia({ businessId, inviteId, file, kind = 'image', slot }: {
  businessId: string
  inviteId: string
  file: File
  kind?: MediaKind
  slot: string // e.g. "hero-image", "gallery"
}) {
  validateFile(file, kind)
  const prepared = kind === 'image' ? await compressImage(file) : { blob: file as Blob, type: file.type, ext: extOf(file.type) }

  const safeSlot = slot.replace(/[^a-z0-9-]/gi, '-').toLowerCase()
  const path = `${businessId}/${inviteId}/${safeSlot}-${crypto.randomUUID()}.${prepared.ext}`
  const { error } = await supabase.storage.from(BUCKET).upload(path, prepared.blob, {
    contentType: prepared.type,
    cacheControl: '31536000',
    upsert: false,
  })
  if (error) throw new MediaError(error.message)
  return { url: supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl, path }
}

const MARKER = `/storage/v1/object/public/${BUCKET}/`

/** Best-effort delete of a file we uploaded. Links to other sites, and other businesses' files, are ignored. */
export async function removeInviteMedia(url: string, businessId: string): Promise<void> {
  const i = url.indexOf(MARKER)
  if (i === -1) return
  const path = decodeURIComponent(url.slice(i + MARKER.length).split('?')[0])
  if (!path.startsWith(`${businessId}/`)) return
  await supabase.storage.from(BUCKET).remove([path]).then(() => undefined, () => undefined)
}
