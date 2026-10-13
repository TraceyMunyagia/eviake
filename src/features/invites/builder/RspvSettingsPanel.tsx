import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Field, TextInput, inputClass } from '@/components/ui/Field'
import type { InviteContent } from '@/types/database'

type Question = NonNullable<InviteContent['rsvp_questions']>[number]
type RsvpFields = Pick<InviteContent, 'rsvp_deadline' | 'rsvp_max_party' | 'rsvp_questions'>

// Every change goes through the builder's autosave (onChange), so there is no separate Save button to forget
export function RsvpSettingsPanel({ content, advanced, onChange }: {
  content: InviteContent
  advanced: boolean
  onChange: (patch: RsvpFields) => void
}) {
  const questions = content.rsvp_questions ?? []
  const [maxParty, setMaxParty] = useState(String(content.rsvp_max_party ?? 10))
  useEffect(() => setMaxParty(String(content.rsvp_max_party ?? 10)), [content.rsvp_max_party])

  const [label, setLabel] = useState('')
  const [type, setType] = useState<Question['type']>('text')
  const [options, setOptions] = useState('')
  const [required, setRequired] = useState(false)
  const [draftError, setDraftError] = useState<string | null>(null)

  function addQuestion() {
    if (!label.trim()) return setDraftError('Give the question some text.')
    const opts = options.split(',').map((o) => o.trim()).filter(Boolean)
    if (type === 'choice' && opts.length < 2) return setDraftError('Add at least two options, separated by commas.')
    setDraftError(null)
    onChange({
      rsvp_questions: [
        ...questions,
        { id: `q_${Date.now().toString(36)}`, label: label.trim(), type, options: type === 'choice' ? opts : undefined, required },
      ],
    })
    setLabel(''); setOptions(''); setRequired(false); setType('text')
  }

  return (
    <div className="space-y-5 rounded-2xl border border-line bg-white p-5 shadow-sm">
      <div>
        <TextInput
          id="rs-deadline" label="RSVP by" type="date" value={content.rsvp_deadline ?? ''}
          max={content.event_date || undefined}
          onChange={(e) => onChange({ rsvp_deadline: e.target.value || undefined })}
        />
        <p className="mt-1 text-xs text-muted">
          {content.rsvp_deadline
            ? "Guests see a countdown to this date, and the RSVP form closes after it (replies stay open all day on the date itself)."
            : 'Optional. Set one and guests see a countdown on the RSVP section.'}
        </p>
        {content.rsvp_deadline && content.event_date && content.rsvp_deadline > content.event_date && (
          <p role="alert" className="mt-1 text-xs text-amber-800">⚠ This is after the event date ({content.event_date}).</p>
        )}
      </div>

      {!advanced ? (
        <p className="rounded-lg bg-gold-100 px-3 py-2 text-xs text-plum-900">
          Guest limits and custom questions are a Signature and Experience feature.
          This invite's Essential package shows a simple name + attending RSVP only.
        </p>
      ) : (
        <p className="text-xs text-muted">Applies across Editorial, Romance and Celebration.</p>
      )}

      {advanced && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput
              id="rs-max" label="Max guests per reply (including them)" type="number" min={1} max={50} value={maxParty}
              onChange={(e) => {
                setMaxParty(e.target.value)
                const n = Math.floor(Number(e.target.value))
                if (n >= 1) onChange({ rsvp_max_party: Math.min(50, n) })
              }}
              onBlur={() => setMaxParty(String(content.rsvp_max_party ?? 10))}
            />
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-plum-900">Custom questions</p>
            {questions.length > 0 && (
              <ul className="space-y-2">
                {questions.map((q) => (
                  <li key={q.id} className="flex items-start gap-3 rounded-lg border border-line px-3 py-2 text-sm">
                    <div className="flex-1">
                      <p className="font-medium">{q.label}{q.required ? ' *' : ''}</p>
                      <p className="text-xs text-muted">{q.type === 'choice' ? `Choose one: ${q.options?.join(', ')}` : 'Short answer'}</p>
                    </div>
                    <button aria-label={`Remove ${q.label}`} onClick={() => onChange({ rsvp_questions: questions.filter((x) => x.id !== q.id) })} className="text-muted hover:text-red-700">
                      <Trash2 className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="space-y-3 rounded-lg border border-dashed border-line p-3">
              <TextInput
                id="rs-q" label="Question" placeholder="Any dietary requirements?" value={label}
                onChange={(e) => setLabel(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addQuestion() } }}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Answer type" htmlFor="rs-type">
                  <select id="rs-type" value={type} onChange={(e) => setType(e.target.value as Question['type'])} className={inputClass}>
                    <option value="text">Short answer</option>
                    <option value="choice">Choose one</option>
                  </select>
                </Field>
                {type === 'choice' && (
                  <TextInput id="rs-opts" label="Options (comma separated)" placeholder="Chicken, Vegetarian, Vegan" value={options} onChange={(e) => setOptions(e.target.value)} />
                )}
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={required} onChange={(e) => setRequired(e.target.checked)} className="size-4" />
                Guests must answer this
              </label>
              {draftError && <p role="alert" className="text-sm text-red-700">{draftError}</p>}
              {label.trim() && !draftError && <p className="text-xs text-amber-800">Not added yet. Click Add question (or press Enter) to put it on the invite.</p>}
              <Button type="button" variant={label.trim() ? 'primary' : 'secondary'} onClick={addQuestion}><Plus className="size-4" /> Add question</Button>
            </div>
          </div>
      </>
      )}

    </div>
  )
}
