import { MAX_VIDEO_BYTES } from '@/lib/uploadInviteMedia'
import { MediaInput } from '../builder/fields/MediaInput'
import { P } from '../builder/content/contentPaths'
import { usePanel } from '../builder/content/PanelContext'

export function MediaPanel({ videoOn }: { videoOn: boolean }) {
  const { template } = usePanel()
  return (
    <div className="space-y-5">
      {template !== 'romance' && (
        <MediaInput path={P.logo} label="Logo (optional)" slot="logo" hint="Shown small above the title. Good for corporate events." />
      )}

      {template !== 'celebration' ? (
        <p className="text-sm text-muted">Hero video is available on the Celebration template.</p>
      ) : videoOn ? (
        <MediaInput path={P.heroVideo} kind="video" label="Hero video" slot="hero-video"
          hint={`MP4 or WebM, up to ${Math.round(MAX_VIDEO_BYTES / 1024 / 1024)} MB. Aim for 720p and under 15 seconds. It plays muted and loops; visitors who prefer less motion see the hero photo with a play button.`} />
      ) : (
        <p className="rounded-xl border border-line bg-gold-100/40 p-3 text-sm">🔒 Hero video is included in the Experience package.</p>
      )}
    </div>
  )
}
