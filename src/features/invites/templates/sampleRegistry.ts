import type { InviteContent, InviteSections, InviteTemplateKey } from '@/types/database'
import { EDITORIAL_SAMPLE_CONTENT, EDITORIAL_SAMPLE_SECTIONS, EDITORIAL_STRESS_CONTENT, EDITORIAL_STRESS_SECTIONS } from '@/features/invites/templates/editorial/sampleContent'
import { ROMANCE_SAMPLE_CONTENT, ROMANCE_SAMPLE_SECTIONS, ROMANCE_STRESS_CONTENT, ROMANCE_STRESS_SECTIONS } from '@/features/invites/templates/romance/sampleContent'
import { CELEBRATION_SAMPLE_CONTENT, CELEBRATION_SAMPLE_SECTIONS ,CELEBRATION_STRESS_CONTENT, CELEBRATION_STRESS_SECTIONS, } from '@/features/invites/templates/celebration/sampleContent'

type SamplePair = { content: InviteContent; sections: InviteSections }

export const SAMPLE_CONTENT: Partial<Record<InviteTemplateKey, SamplePair>> = {
  editorial: { content: EDITORIAL_SAMPLE_CONTENT, sections: EDITORIAL_SAMPLE_SECTIONS },
  romance: { content: ROMANCE_SAMPLE_CONTENT, sections: ROMANCE_SAMPLE_SECTIONS },
   celebration: { content: CELEBRATION_SAMPLE_CONTENT, sections: CELEBRATION_SAMPLE_SECTIONS },
}

export const STRESS_CONTENT: Partial<Record<InviteTemplateKey, SamplePair>> = {
  editorial: { content: EDITORIAL_STRESS_CONTENT, sections: EDITORIAL_STRESS_SECTIONS },
  romance: { content: ROMANCE_STRESS_CONTENT, sections: ROMANCE_STRESS_SECTIONS },
  celebration: { content: CELEBRATION_STRESS_CONTENT, sections: CELEBRATION_STRESS_SECTIONS },
}
