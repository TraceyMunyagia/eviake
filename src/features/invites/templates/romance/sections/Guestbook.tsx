import { useState, type FormEvent } from 'react'
import { romanceType } from '@/features/invites/templates/romance/type'
import { Divider } from '@/features/invites/templates/romance/components/Divider'
import { SectionLabel } from '@/features/invites/templates/romance/components/SectionLabel'
import { Reveal } from '@/features/invites/templates/romance/components/Reveal'
import type { GuestbookMessage } from '@/types/database'
import type { TemplateProps } from '@/features/invites/templates/types'

const TILTS = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2']

export function Guestbook({ messages, mode, onSubmit, available }: {
  messages?: GuestbookMessage[]
  mode?: 'preview' | 'public'
  onSubmit?: TemplateProps['onGuestbookSubmit']
  available?: boolean
}) {
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done'>('idle')
  const [error, setError] = useState<string | null>(null)

  const inPreview = mode === 'preview'
  const canSubmit = inPreview || (Boolean(onSubmit) && available !== false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return setError('Please tell us your name.')
    if (!message.trim()) return setError('Write a little something first.')
    setError(null)
    setStatus('submitting')
    try {
      if (onSubmit) {
        await onSubmit({ name: name.trim(), message: message.trim() })
      } else {
        await new Promise((r) => setTimeout(r, 500)) // preview-only demo; nothing is saved
      }
      setStatus('done')
      setName('')
      setMessage('')
    } catch (err) {
      setStatus('idle')
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    }
  }

  return (
    <Reveal mode={mode}>
      <section className="mx-auto max-w-2xl px-6 py-16 text-center sm:py-24" style={{ color: 'var(--invite-primary)' }}>
        <SectionLabel>Well wishes</SectionLabel>
        <h2 className={`mt-3 ${romanceType.h2}`} style={{ fontFamily: 'var(--invite-heading-font)' }}>Guestbook</h2>
        <Divider className="my-6" />

        {!canSubmit ? (
          <p className={romanceType.body} style={{ color: 'var(--invite-muted)', fontFamily: 'var(--invite-body-font)' }}>
            The guestbook opens on the day of the event.
          </p>
        ) : status === 'done' ? (
          <p className={romanceType.body} style={{ fontFamily: 'var(--invite-body-font)' }}>
            Thank you for your kind words — they mean the world to us.
          </p>
        ) : (
          <form onSubmit={submit} className="mx-auto max-w-sm space-y-3 text-left">
            {inPreview && (
              <p className="text-xs italic opacity-70" style={{ fontFamily: 'var(--invite-body-font)' }}>Preview only — nothing here is saved.</p>
            )}
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              aria-label="Your name"
              className="w-full rounded-2xl border px-4 py-2.5 text-sm"
              style={{ borderColor: 'var(--invite-hairline)', fontFamily: 'var(--invite-body-font)' }}
            />
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Leave a message for the couple…"
              aria-label="Your message"
              rows={3}
              maxLength={500}
              className="w-full rounded-2xl border px-4 py-2.5 text-sm"
              style={{ borderColor: 'var(--invite-hairline)', fontFamily: 'var(--invite-body-font)' }}
            />
            {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full rounded-full px-4 py-2.5 text-sm font-medium disabled:opacity-60"
              style={{ backgroundColor: 'var(--invite-accent)', color: 'var(--invite-primary)', fontFamily: 'var(--invite-body-font)' }}
            >
              {status === 'submitting' ? 'Sending…' : 'Sign the guestbook'}
            </button>
          </form>
        )}

        {messages && messages.length > 0 && (
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`w-52 rounded-sm border bg-white p-4 text-left shadow-sm ${TILTS[i % TILTS.length]}`}
                style={{ borderColor: 'var(--invite-hairline)' }}
              >
                <p className={`${romanceType.body} whitespace-pre-wrap`} style={{ fontFamily: 'var(--invite-body-font)' }}>{m.message}</p>
                <p className="mt-2 text-lg" style={{ fontFamily: 'var(--invite-accent-font)', color: 'var(--invite-accent)' }}>{m.guest_name}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </Reveal>
  )
}
