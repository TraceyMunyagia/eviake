import { useState, type FormEvent, type ReactNode } from 'react'
import type { InviteContent } from '@/types/database'
import type { RsvpPayload, TemplateProps } from '@/features/invites/templates/types'

export function SimpleRsvpForm({
  content, mode, onRsvp, rounded, buttonLabel = 'Send RSVP', fontFamily = 'var(--invite-body-font)', advanced,
}: {
  content: InviteContent
  mode?: 'preview' | 'public'
  onRsvp?: TemplateProps['onRsvp']
  rounded?: boolean
  buttonLabel?: string
  fontFamily?: string
  advanced?: boolean
}) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [attending, setAttending] = useState<boolean | null>(null)
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done'>('idle')
  const [error, setError] = useState<string | null>(null)

  const inPreview = mode === 'preview'
  const canSubmit = Boolean(onRsvp) || inPreview
  const radius = rounded ? 'rounded-2xl' : 'rounded-sm'
  const questions = content.rsvp_questions ?? []
  const [answers, setAnswers] = useState<Record<string, string>>({})

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return setError('Please tell us your name.')
    if (!phone.trim()) return setError('Please enter your phone number.')
    if (attending === null) return setError('Please let us know if you can attend.')
    const missing = questions.find((q) => q.required && !answers[q.id]?.trim())
    if (missing) return setError(`Please answer: ${missing.label}`)
    setError(null)
    setStatus('submitting')
    try {
      if (onRsvp) {
        await onRsvp({
          name: name.trim(),
          phone: phone.trim(),
          attending,
          party_size: attending ? 1 : 0,
          answers,
        })
      } else {
        await new Promise((r) => setTimeout(r, 500))
      }
      setStatus('done')
    } catch (err) {
      setStatus('idle')
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    }
  }

  if (!canSubmit) {
    return (
      <p className="text-sm opacity-80" style={{ fontFamily }}>RSVPs open soon.</p>
    )
  }

  if (status === 'done') {
    return (
      <div>
        <p className="text-sm font-medium" style={{ fontFamily }}>
          {attending ? `Thank you, ${name.trim()} — we can't wait to see you!` : `Thank you for letting us know, ${name.trim()}.`}
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="mx-auto mt-2 max-w-sm space-y-3 text-left">
      {inPreview && <p className="text-xs opacity-70" style={{ fontFamily }}>Preview only — nothing here is saved.</p>}
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        aria-label="Your name"
        className={`w-full border px-3 py-2 text-sm ${radius}`}
        style={{ borderColor: 'var(--invite-hairline)', fontFamily }}
      />
      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Your phone number"
        aria-label="Your phone number"
        autoComplete="tel"
        className={`w-full border px-3 py-2 text-sm ${radius}`}
        style={{ borderColor: 'var(--invite-hairline)', fontFamily }}
      />
      <div role="group" aria-label="Will you attend?" className="flex gap-2">
        {([[true, 'Accepts with pleasure'], [false, 'Regretfully declines']] as [boolean, string][]).map(([val, label]) => (
          <button
            key={String(val)}
            type="button"
            aria-pressed={attending === val}
            onClick={() => setAttending(val)}
            className={`flex-1 border px-3 py-2 text-xs ${radius}`}
            style={{
              borderColor: 'var(--invite-hairline)',
              backgroundColor: attending === val ? 'var(--invite-accent)' : 'transparent',
              color: 'var(--invite-primary)',
              fontFamily,
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {questions.map((q) => (
        <div key={q.id}>
          <label htmlFor={`rsvp-question-${q.id}`} className="mb-1 block text-xs" style={{ color: 'var(--invite-muted)', fontFamily }}>
            {q.label}{q.required ? ' *' : ''}
          </label>
          {q.type === 'choice' ? (
            <select
              id={`rsvp-question-${q.id}`}
              value={answers[q.id] ?? ''}
              onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
              aria-label={q.label}
              className={`w-full border px-3 py-2 text-sm ${radius}`}
              style={{ borderColor: 'var(--invite-hairline)', fontFamily }}
            >
              <option value="">Select an option</option>
              {q.options?.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          ) : (
            <input
              id={`rsvp-question-${q.id}`}
              value={answers[q.id] ?? ''}
              onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
              placeholder="Your answer"
              aria-label={q.label}
              className={`w-full border px-3 py-2 text-sm ${radius}`}
              style={{ borderColor: 'var(--invite-hairline)', fontFamily }}
            />
          )}
        </div>
      ))}
      {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={status === 'submitting'}
        className={`w-full px-4 py-2.5 text-sm font-medium disabled:opacity-60 ${radius}`}
        style={{ backgroundColor: 'var(--invite-primary)', color: 'var(--invite-background)', fontFamily }}
      >
        {status === 'submitting' ? 'Sending…' : buttonLabel}
      </button>
    </form>
  ) as ReactNode
}
