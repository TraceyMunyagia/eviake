import { TextAreaField, TextField } from '../fields/Fields'
import { P } from '../content/contentPaths'
import { usePanel } from '../content/PanelContext'

export function MessagePanel() {
  const { template } = usePanel()
  return (
    <div className="space-y-4">
      <TextAreaField
        path={P.message}
        label={template === 'celebration' ? 'Event description' : 'Invitation message'}
        hint={template === 'celebration' ? undefined : 'Leave blank for an automatic line using the names and event type.'}
        rows={5}
      />
      {template === 'romance' && <TextField path={P.quote} label="Quote (optional)" hint="Shown above the message." />}
      <TextField path={P.signoff} label="Sign-off" placeholder="e.g. With love, Tania & Surie" />
    </div>
  )
}
