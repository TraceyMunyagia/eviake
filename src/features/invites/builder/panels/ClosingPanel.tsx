import { RegistryEditor } from '../RegistryEditor'
import { MediaInput } from '../fields/MediaInput'
import { TextAreaField, TextField } from '../fields/Fields'
import { P } from '../content/contentPaths'
import { usePanel } from '../content/PanelContext'

export function ClosingPanel() {
  const { template, get, setPath } = usePanel()
  return (
    <div className="space-y-4">
      <TextAreaField path={P.closingMessage} label="Closing message" rows={3} />
      {/* Editorial's closing has no image */}
      {template !== 'editorial' && (
        <MediaInput path={P.closingImage} label={template === 'romance' ? 'Closing photo (shown in a circle)' : 'Closing photo (optional)'} />
      )}
      {template === 'celebration' && (
        <>
          <TextField path={P.hashtag} label="Event hashtag" placeholder="#TaniaTurns30" />
          <TextField path={P.marquee} label="Scrolling banner text" placeholder="SEE YOU THERE" hint="Leave blank to use the hashtag, names and date." />
          <RegistryEditor
            idPrefix="soc"
            title="Social links"
            nameLabel="Platform"
            namePlaceholder="Instagram"
            items={get(P.socialLinks) ?? []}
            onChange={(v) => setPath(P.socialLinks, v)}
          />
        </>
      )}
    </div>
  )
}
