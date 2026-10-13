import { SwitchField, TextField } from '../fields/Fields'
import { P } from '../content/contentPaths'
import { usePanel } from '../content/PanelContext'
import { deriveInitials } from './initials'

export function RomanceCoverFields() {
  const { get } = usePanel()
  const auto = deriveInitials(get(P.names) || get(P.title))
  return (
    <div className="space-y-4 rounded-xl border border-line bg-gold-100/40 p-3">
      <p className="text-sm font-medium">Tap-to-open cover</p>
      <SwitchField path={P.coverEnabled} label="Show the cover" hint="Guests tap the seal to open the invitation. The preview skips it; open the public link to see it." />
      <TextField path={P.coverInitials} label="Initials" placeholder={auto || 'T|S'} hint="Leave blank to use the names. Use | between initials." />
      <TextField path={P.coverLine} label="Cover line" placeholder="You're invited" />
      <TextField path={P.coverHint} label="Tap hint" placeholder="Tap to open" />
    </div>
  )
}
