// The only file that touches the editors built in earlier weeks; fix their props here and nowhere else.
import { ScheduleEditor } from '../ScheduleEditor'
import { StoryEditor } from '../StoryEditor'
import { RegistryEditor } from '../RegistryEditor'
import { RsvpSettingsPanel } from '../RspvSettingsPanel'
import { GuestbookPanel } from '../GuestbookPanel'
import { MediaInput } from '../fields/MediaInput'
import { TextAreaField, TextField } from '../fields/Fields'
import { P } from '../content/contentPaths'
import { usePanel } from '../content/PanelContext'

export function SchedulePanel() {
  const { get, setPath } = usePanel()
  return <ScheduleEditor items={get(P.schedule) ?? []} onChange={(v) => setPath(P.schedule, v)} />
}

/** Editorial "About / Story" is a title, text and two photos; Romance "Our story" is a timeline. */
export function StoryPanel() {
  const { template, get, setPath } = usePanel()
  if (template === 'romance') return <StoryEditor items={get(P.story) ?? []} onChange={(v) => setPath(P.story, v)} />
  return (
    <div className="space-y-4">
      <TextField path={P.aboutTitle} label="Story heading" placeholder="How it began" />
      <TextAreaField path={P.aboutText} label="Story text" rows={5} />
      <MediaInput path={P.aboutImage} label="Photo" />
      <MediaInput path={P.aboutImage2} label="Second photo (optional)" />
    </div>
  )
}

export function GiftPanel() {
  const { get, setPath } = usePanel()
  return (
    <div className="space-y-4">
      <TextAreaField path={P.giftMessage} label="Gift message (optional)" rows={3} />
      <RegistryEditor items={get(P.registry) ?? []} onChange={(v) => setPath(P.registry, v)} />
    </div>
  )
}

// The guestbook moderates messages in its own table, so it only needs the invite
export function RsvpPanel() {
  const { invite, updateInvite } = usePanel()
  // Same rule as the templates: questions, deadline and party size are Signature/Experience features
  const advanced = invite.package === 'experience' || !!invite.sections.rsvp_advanced
  return (
    <RsvpSettingsPanel
      content={invite.content}
      advanced={advanced}
      onChange={(patch) => updateInvite((current) => ({ content: { ...current.content, ...patch } }))}
    />
  )
}

export function GuestbookSectionPanel() {
  const { invite } = usePanel()
  return <GuestbookPanel invite={invite} />
}
