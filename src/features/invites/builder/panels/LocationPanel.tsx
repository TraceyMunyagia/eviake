import { MediaInput } from '../fields/MediaInput'
import { TextAreaField, TextField } from '../fields/Fields'
import { P } from '../content/contentPaths'
import { usePanel } from '../content/PanelContext'

export function LocationPanel() {
  const { template } = usePanel()
  return (
    <div className="space-y-4">
      <TextField path={P.venueName} label="Venue name" />
      <TextField path={P.venueAddress} label="Address" />
      <TextField path={P.mapUrl} type="url" label="Map link (optional)" placeholder="https://maps.app.goo.gl/…" hint="Paste a Google Maps share link for the Get directions button. Without one, it searches for the venue and address." />
      <TextAreaField path={P.venueNotes} label="Parking and arrival notes" rows={3} />
      {template === 'romance' && <MediaInput path={P.venuePhoto} label="Venue photo" hint="Shown above the map." />}
    </div>
  )
}
