import { MediaInput } from '../fields/MediaInput'
import { TextField } from '../fields/Fields'
import { P } from '../content/contentPaths'
import { usePanel } from '../content/PanelContext'
import { RomanceCoverFields } from './RomanceCoverFields'

export function HeroPanel() {
  const { template } = usePanel()
  return (
    <div className="space-y-4">
      <TextField path={P.title} label="Event title" placeholder="e.g. Tania & Surie's Wedding" />
      <TextField path={P.names} label="Hosts / celebrants" placeholder="e.g. Tania & Surie" />
      <MediaInput path={P.heroImage} label="Hero photo" />
      {/* Romance shows the hero photo as a background, so it has no alt text */}
      {template !== 'romance' && <TextField path={P.heroAlt} label="Photo description (for screen readers)" />}
      {template === 'romance' && <RomanceCoverFields />}
    </div>
  )
}
