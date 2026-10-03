import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Field, TextInput, inputClass } from '@/components/ui/Field'
import type { Invite, InviteContent } from '@/types/database'

type Question = NonNullable<InviteContent['rsvp_questions']>[number]

export function RsvpSettingsPanel({ invite, onSaved }: { invite: Invite; onSaved: (invite: Invite) => void }) {
  const [deadline, setDeadline] = useState(invite.content.rsvp_deadline || '')
  const [maxParty, setMaxParty] = useState(String(invite.content.rsvp_max_party ?? 10))
  const [questions, setQuestions] = useState<Question[]>(invite.content.rsvp_questions || [])

  const [label, setLabel] = useState('')
  const [type, setType] = useState<Question['type']>('text')
  const [options, setOptions] = useState('')
  const [required, setRequired] = useState(false)
  const [draftError, setDraftError] = useState<string | null>(null)

  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)
  const advanced = invite.package === 'experience' || invite.sections.rsvp_advanced

  useEffect(() => {
    setDeadline(invite.content.rsvp_deadline || '')
    setMaxParty(String(invite.content.rsvp_max_party ?? 10))
    setQuestions(invite.content.rsvp_questions || [])
  }, [invite.id, invite.content])

  async function addQuestion() {
    if (!label.trim()) return setDraftError('Give the question some text.')
    const opts = options.split(',').map((o) => o.trim()).filter(Boolean)
    if (type === 'choice' && opts.length < 2) return setDraftError('Add at least two options, separated by commas.')
    setDraftError(null)
    const nextQuestions = [
      ...questions,
      { id: `q_${Date.now().toString(36)}`, label: label.trim(), type, options: type === 'choice' ? opts : undefined, required },
    ]
    setQuestions(nextQuestions)
    await save(nextQuestions)
    if (message?.ok === false) return
    setLabel(''); setOptions(''); setRequired(false); setType('text')
  }

  async function save(nextQuestions = questions) {
    setBusy(true)
    setMessage(null)
    const content: InviteContent = {
      ...invite.content,
      rsvp_deadline: deadline || undefined,
      rsvp_max_party: Math.min(50, Math.max(1, Math.floor(Number(maxParty) || 1))),
      rsvp_questions: nextQuestions,
    }
    const { data, error } = await supabase.from('invites').update({ content }).eq('id', invite.id).select('*').single()
    setBusy(false)
    if (error) return setMessage({ ok: false, text: error.message })
    onSaved(data as Invite)
    setMessage({ ok: true, text: 'Saved.' })
  }

  return (
    <div className="space-y-5 rounded-2xl border border-line bg-white p-5 shadow-sm">
      {!advanced ? (
        <p className="rounded-lg bg-gold-100 px-3 py-2 text-xs text-plum-900">
          Reply-by deadlines, guest limits and custom questions are a Signature and Experience feature.
          This invite's Essential package shows a simple name + attending RSVP only.
        </p>
      ) : (
        <p className="text-xs text-muted">Applies across Editorial, Romance and Celebration.</p>
      )}

      {advanced && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput id="rs-deadline" label="Reply-by date" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            <TextInput id="rs-max" label="Max guests per reply (including them)" type="number" min={1} max={50} value={maxParty} onChange={(e) => setMaxParty(e.target.value)} />
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
                    <button aria-label={`Remove ${q.label}`} onClick={() => setQuestions((prev) => prev.filter((x) => x.id !== q.id))} className="text-muted hover:text-red-700">
                      <Trash2 className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="space-y-3 rounded-lg border border-dashed border-line p-3">
              <TextInput id="rs-q" label="Question" placeholder="Any dietary requirements?" value={label} onChange={(e) => setLabel(e.target.value)} />
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
              <Button type="button" variant="secondary" onClick={addQuestion}><Plus className="size-4" /> Add question</Button>
            </div>
          </div>
      </>
      )}

      {message && <p role={message.ok ? 'status' : 'alert'} className={message.ok ? 'text-sm text-green-800' : 'text-sm text-red-700'}>{message.text}</p>}
      <Button onClick={() => save()} disabled={busy}>{busy ? 'Saving…' : 'Save RSVP settings'}</Button>
    </div>
  )
}
