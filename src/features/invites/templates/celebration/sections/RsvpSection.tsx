import { useState, type FormEvent } from 'react'
import { Minus, Plus, Sparkles } from 'lucide-react'
import { celebrationType } from '@/features/invites/templates/celebration/type'
import { ActionButton } from '@/features/invites/templates/celebration/components/ActionButton'
import { Confetti } from '@/features/invites/templates/celebration/components/Confetti'
import { Reveal } from '@/features/invites/templates/celebration/components/Reveal'
import { formatEventDate, parseEventDate } from '@/lib/eventFormat'
import type { TemplateProps } from '@/features/invites/templates/types'
import type { InviteContent } from '@/types/database'

type Status = 'idle' | 'submitting' | 'done'

const card = { borderColor: 'var(--invite-primary)', backgroundColor: 'var(--invite-background)', boxShadow: '8px 8px 0 var(--invite-primary)' }
const inputStyle = { borderColor: 'var(--invite-primary)', backgroundColor: 'var(--invite-background)', color: 'var(--invite-primary)', fontFamily: 'var(--invite-body-font)' }
const choiceStyle = (on: boolean) => ({
  borderColor: 'var(--invite-primary)',
  backgroundColor: on ? 'var(--invite-primary)' : 'var(--invite-background)',
  color: on ? 'var(--invite-background)' : 'var(--invite-primary)',
  boxShadow: on ? 'none' : '4px 4px 0 var(--invite-primary)',
  fontFamily: 'var(--invite-heading-font)',
})

export function RsvpSection({ content, mode, onRsvp, advanced, guestManagement }: {
  content: InviteContent
  mode?: 'preview' | 'public'
  onRsvp?: TemplateProps['onRsvp']
  advanced?: boolean
  guestManagement?: boolean
}) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [attending, setAttending] = useState<boolean | null>(null)
  const [party, setParty] = useState(1)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const [burst, setBurst] = useState(0)

  const inPreview = mode === 'preview'
  const maxParty = Math.max(1, content.rsvp_max_party ?? 10)
  const questions = content.rsvp_questions ?? []
  const deadline = parseEventDate(content.rsvp_deadline)
  const closed = deadline ? Date.now() >= deadline.getTime() + 86_400_000 : false // open through the deadline day
  // Without a submit handler the form is only ever a preview demo. A published
  // invite must not pretend to record a response it can't save.
  const canSubmit = Boolean(onRsvp) || inPreview

  function reset() {
    setName(''); setAttending(null); setParty(1); setAnswers({}); setStatus('idle'); setError(null)
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return setError('Tell us your name!')
    if (!phone.trim()) return setError('Please enter your phone number.')
    if (attending === null) return setError('Are you in or out?')
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
          party_size: advanced && attending ? party : attending ? 1 : 0,
          answers: advanced ? answers : {},
        })
      } else {
        await new Promise((r) => setTimeout(r, 600)) // preview-only demo; nothing is saved
      }
      setStatus('done')
      if (attending) setBurst((b) => b + 1)
    } catch (err) {
      setStatus('idle')
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    }
  }

  const stepBtn = 'cel-press flex size-12 items-center justify-center rounded-full border-4 disabled:opacity-40'

  return (
    <section className="relative overflow-hidden px-5 py-16 sm:px-10 sm:py-24" style={{ backgroundColor: 'var(--invite-accent)', color: 'var(--invite-primary)' }}>
      <Confetti burst={burst} />
      <Reveal mode={mode} className="relative mx-auto max-w-2xl">
        <span
          className={`inline-block rotate-2 rounded-full border-2 px-4 py-1.5 ${celebrationType.kicker}`}
          style={{ borderColor: 'var(--invite-primary)', backgroundColor: 'var(--invite-secondary)', fontFamily: 'var(--invite-body-font)' }}
        >
          Are you in?
        </span>
        <h2 className={`mt-5 ${celebrationType.h2}`} style={{ fontFamily: 'var(--invite-heading-font)' }}>RSVP</h2>
        {deadline && !closed && (
          <p className={`mt-3 ${celebrationType.body} font-semibold`} style={{ fontFamily: 'var(--invite-body-font)' }}>
            Reply by {formatEventDate(content.rsvp_deadline)}
          </p>
        )}

        <div className="mt-8">
          {closed ? (
            <div className="rounded-3xl border-4 p-8 text-center" style={card}>
              <p className={celebrationType.statement} style={{ fontFamily: 'var(--invite-heading-font)' }}>RSVPs are closed.</p>
              <p className={`mt-2 ${celebrationType.body}`} style={{ fontFamily: 'var(--invite-body-font)' }}>
                Need to change your answer? Get in touch with the host.
              </p>
            </div>
          ) : !canSubmit ? (
            <div className="rounded-3xl border-4 p-8 text-center" style={card}>
              <p className={celebrationType.statement} style={{ fontFamily: 'var(--invite-heading-font)' }}>RSVPs open soon.</p>
              <p className={`mt-2 ${celebrationType.body}`} style={{ fontFamily: 'var(--invite-body-font)' }}>Check back in a little while.</p>
            </div>
          ) : status === 'done' ? (
            <div role="status" className="rounded-3xl border-4 p-8 text-center" style={card}>
              <Sparkles className="mx-auto size-10" style={{ color: 'var(--invite-accent)' }} />
              <p className={`mt-3 ${celebrationType.statement}`} style={{ fontFamily: 'var(--invite-heading-font)' }}>
                {attending ? "You're in!" : "We'll miss you!"}
              </p>
              <p className={`mt-2 ${celebrationType.body}`} style={{ fontFamily: 'var(--invite-body-font)' }}>
                {attending
                  ? `See you there, ${name.trim()}${party > 1 ? ` (party of ${party})` : ''}.`
                  : `Thanks for letting us know, ${name.trim()}.`}
              </p>
              {inPreview && (
                <div className="mt-6"><ActionButton tone="light" onClick={reset}>Try it again</ActionButton></div>
              )}
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-6 rounded-3xl border-4 p-6 sm:p-8" style={card} noValidate>
              {inPreview && (
                <p className="rounded-xl px-3 py-2 text-xs font-semibold" style={{ backgroundColor: 'var(--invite-secondary)', fontFamily: 'var(--invite-body-font)' }}>
                  Preview only: nothing entered here is saved.
                </p>
              )}

              <div>
                <label htmlFor="rsvp-name" className={`mb-2 block ${celebrationType.caption}`} style={{ fontFamily: 'var(--invite-body-font)' }}>Your name</label>
                <input id="rsvp-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className="cel-input w-full rounded-2xl border-4 px-4 py-3 text-lg font-semibold" style={inputStyle} />
              </div>

              <div>
                <label htmlFor="rsvp-phone" className={`mb-2 block ${celebrationType.caption}`} style={{ fontFamily: 'var(--invite-body-font)' }}>Your phone number</label>
                <input id="rsvp-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" className="cel-input w-full rounded-2xl border-4 px-4 py-3 text-lg font-semibold" style={inputStyle} />
              </div>

              <div role="group" aria-label="Will you attend?" className="grid grid-cols-2 gap-4">
                <button type="button" aria-pressed={attending === true} onClick={() => setAttending(true)} className="cel-press rounded-2xl border-4 px-4 py-4 text-lg font-extrabold" style={choiceStyle(attending === true)}>
                  I'm in!
                </button>
                <button type="button" aria-pressed={attending === false} onClick={() => setAttending(false)} className="cel-press rounded-2xl border-4 px-4 py-4 text-lg font-extrabold" style={choiceStyle(attending === false)}>
                  Can't make it
                </button>
              </div>

              {attending && advanced && (
                <div>
                  <p className={`mb-2 ${celebrationType.caption}`} style={{ fontFamily: 'var(--invite-body-font)' }}>How many of you? (including you)</p>
                  <div className="flex items-center gap-4">
                    <button type="button" aria-label="Fewer guests" disabled={party <= 1} onClick={() => setParty((p) => Math.max(1, p - 1))} className={stepBtn} style={choiceStyle(false)}><Minus className="size-5" /></button>
                    <span aria-live="polite" className="w-16 text-center text-5xl font-extrabold" style={{ fontFamily: 'var(--invite-heading-font)' }}>{party}</span>
                    <button type="button" aria-label="More guests" disabled={party >= maxParty} onClick={() => setParty((p) => Math.min(maxParty, p + 1))} className={stepBtn} style={choiceStyle(false)}><Plus className="size-5" /></button>
                  </div>
                </div>
              )}

              {questions.map((q) => (
                <div key={q.id}>
                  <label htmlFor={`rsvp-q-${q.id}`} className={`mb-2 block ${celebrationType.caption}`} style={{ fontFamily: 'var(--invite-body-font)' }}>
                    {q.label}{q.required ? ' *' : ''}
                  </label>
                  {q.type === 'choice' ? (
                    <div id={`rsvp-q-${q.id}`} role="group" className="flex flex-wrap gap-3">
                      {q.options?.map((o) => (
                        <button key={o} type="button" aria-pressed={answers[q.id] === o} onClick={() => setAnswers((a) => ({ ...a, [q.id]: o }))} className="cel-press rounded-full border-4 px-4 py-2 text-sm font-bold" style={choiceStyle(answers[q.id] === o)}>
                          {o}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <input id={`rsvp-q-${q.id}`} value={answers[q.id] ?? ''} onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))} className="cel-input w-full rounded-2xl border-4 px-4 py-3 text-base font-semibold" style={inputStyle} />
                  )}
                </div>
              ))}

              {error && <p role="alert" className="text-sm font-bold" style={{ color: 'var(--invite-primary)' }}>{error}</p>}

              <ActionButton submit tone="accent" disabled={status === 'submitting'}>
                {status === 'submitting' ? 'Sending…' : 'Send my RSVP'}
              </ActionButton>
            </form>
          )}
        </div>
      </Reveal>
    </section>
  )
}
