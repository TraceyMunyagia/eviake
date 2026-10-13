import type { Invite } from '@/types/database'
import type { PackageKey, TemplateKey } from '../sections/catalog'
import type { SectionFlags } from '../sections/sectionModel'
import { PanelProvider, type UpdateInvite } from '../builder/content/PanelContext'
import { FontsPanel } from './FontsPanel'
import { ColourPanel } from './ColourPanel'
import { MediaPanel } from './MediaPanel'
import { MusicPanel } from './MusicPanel'

export function DesignStep({ invite, template, pkg, flags, updateInvite, replaceInvite }: {
  invite: Invite
  template: TemplateKey
  pkg: PackageKey
  flags: SectionFlags
  updateInvite: UpdateInvite
  replaceInvite: (invite: Invite) => void
}) {
  return (
    <PanelProvider invite={invite} template={template} pkg={pkg} updateInvite={updateInvite} replaceInvite={replaceInvite}>
      <div className="space-y-6">
        <div>
          <h2 className="font-display text-lg text-plum-900">Design &amp; media</h2>
          <p className="text-sm text-muted">Fonts, colours, logo, video and music. The preview updates as you go.</p>
        </div>
        {[
          { title: 'Fonts', body: <FontsPanel /> },
          { title: 'Colours', body: <ColourPanel /> },
          { title: 'Logo & video', body: <MediaPanel videoOn={!!flags.video} /> },
          { title: 'Music', body: <MusicPanel /> },
        ].map((s) => (
          <section key={s.title} className="space-y-3 rounded-2xl border border-line bg-white p-4 shadow-sm">
            <h3 className="font-medium text-plum-900">{s.title}</h3>
            {s.body}
          </section>
        ))}
      </div>
    </PanelProvider>
  )
}
