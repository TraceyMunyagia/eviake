import { createContext, useContext, type ReactNode } from 'react'
import type { Invite } from '@/types/database'
import type { PackageKey, TemplateKey } from '../../sections/catalog'
import { getIn, setIn, type Content } from './contentPath'

/** A patch, or a function of the latest invite (use that for content so quick edits never overwrite each other). */
export type InvitePatch = Partial<Invite> | ((current: Invite) => Partial<Invite>)
export type UpdateInvite = (patch: InvitePatch) => void

interface PanelCtx {
  invite: Invite
  template: TemplateKey
  pkg: PackageKey
  content: Content
  get: (path: string) => any
  setPath: (path: string, value: unknown) => void
  updateInvite: UpdateInvite
  /** Replace the local invite with a row a panel already saved itself. */
  replaceInvite: (invite: Invite) => void
  /** Upload a file to the invite's media folder and return its public URL. */
  upload: (file: File, kind?: 'image' | 'video' | 'audio') => Promise<string>
}

const Ctx = createContext<PanelCtx | null>(null)

export function PanelProvider({ invite, template, pkg, updateInvite, replaceInvite, upload, children }: {
  invite: Invite
  template: TemplateKey
  pkg: PackageKey
  updateInvite: UpdateInvite
  replaceInvite: (invite: Invite) => void
  upload: PanelCtx['upload']
  children: ReactNode
}) {
  const content: Content = invite.content ?? {}
  const value: PanelCtx = {
    invite, template, pkg, content, updateInvite, replaceInvite, upload,
    get: (path) => getIn(content, path),
    setPath: (path, v) => updateInvite((current) => ({ content: setIn(current.content, path, v) })),
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function usePanel(): PanelCtx {
  const c = useContext(Ctx)
  if (!c) throw new Error('usePanel must be used inside <PanelProvider>')
  return c
}
