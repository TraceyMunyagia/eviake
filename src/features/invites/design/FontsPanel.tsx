import { tokenStyle } from '../templates/tokenStyle'
import { usePanel } from '../builder/content/PanelContext'
import { FontPicker } from './FontPicker'
import { TEMPLATE_FONT_DEFAULTS, TEMPLATE_FONT_OPTIONS } from './fontRegistry'
import { T, type Tokens } from './tokenKeys'

export function FontsPanel() {
  const { invite, template, updateInvite } = usePanel()
  const tokens = (invite.tokens ?? {}) as Tokens
  const hasAccent = !!TEMPLATE_FONT_OPTIONS[template].accent

  const set = (key: string, family: string) => updateInvite((current) => ({ tokens: { ...current.tokens, [key]: family } }))
  const reset = () =>
    updateInvite((current) => {
      const next: Tokens = { ...(current.tokens as Tokens), ...TEMPLATE_FONT_DEFAULTS[template] }
      if (!hasAccent) delete next[T.accentFont]
      return { tokens: next }
    })

  return (
    <div className="space-y-4">
      <FontPicker label="Headings" role="heading" template={template} value={tokens[T.headingFont]} onChange={(f) => set(T.headingFont, f)} />
      <FontPicker label="Body text" role="body" template={template} value={tokens[T.bodyFont]} onChange={(f) => set(T.bodyFont, f)} />
      {hasAccent && (
        <FontPicker label="Script accent (names and sign-offs)" role="accent" template={template} value={tokens[T.accentFont]} onChange={(f) => set(T.accentFont, f)} />
      )}

      <div data-invite-root style={tokenStyle(invite.tokens)} className="rounded-xl border border-line p-4" >
        <p className="text-xs uppercase tracking-wide text-muted">Sample</p>
        <h3 className="mt-1 text-3xl" style={{ fontFamily: 'var(--invite-heading-font)', color: 'var(--invite-primary)' }}>Tania &amp; Surie</h3>
        {hasAccent && <p className="mt-1 text-2xl" style={{ fontFamily: 'var(--invite-accent-font)', color: 'var(--invite-primary)' }}>with love</p>}
        <p className="mt-1" style={{ fontFamily: 'var(--invite-body-font)', color: 'var(--invite-primary)' }}>Saturday, 14 June · 3:00 PM · Karen, Nairobi</p>
      </div>

      <button type="button" className="text-sm text-plum-900 underline-offset-4 hover:underline" onClick={reset}>Reset fonts to template default</button>
    </div>
  )
}
