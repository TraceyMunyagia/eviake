import type { ComponentType } from 'react'
import { EditorialTemplate } from '@/features/invites/templates/editorial/EditorialTemplate'
import type { InviteTemplateKey } from '@/types/database'
import type { TemplateProps } from '@/features/invites/templates/types'

// Romance and Celebration register here once built (Week 11–12). The
// builder and the public page both look templates up through this map —
// adding a new template is a one-line addition here, not a rewire of
// either consumer.
export const TEMPLATE_COMPONENTS: Partial<Record<InviteTemplateKey, ComponentType<TemplateProps>>> = {
  editorial: EditorialTemplate,
}

export function getTemplateComponent(key: InviteTemplateKey) {
  return TEMPLATE_COMPONENTS[key] ?? null
}