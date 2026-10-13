import { Button } from '@/components/ui/Button'

export const STEPS = [
  { id: 'template', label: 'Template' },
  { id: 'sections', label: 'Sections' },
  { id: 'details', label: 'Details' },
  { id: 'design', label: 'Design & media' },
  { id: 'publish', label: 'Publish' },
] as const
export type StepId = (typeof STEPS)[number]['id']

export function BuilderSteps({ step, onStep }: { step: StepId; onStep: (s: StepId) => void }) {
  const current = STEPS.findIndex((s) => s.id === step)
  return (
    <nav aria-label="Builder steps" className="flex flex-wrap items-center gap-1.5 text-sm">
      {STEPS.map((s, i) => (
        <button
          key={s.id}
          type="button"
          onClick={() => onStep(s.id)}
          aria-current={s.id === step ? 'step' : undefined}
          className={`flex items-center gap-2 rounded-full border px-3 py-1.5 transition ${
            s.id === step
              ? 'border-gold-500 bg-gold-100 font-medium text-plum-900'
              : i < current ? 'border-line bg-white text-ink' : 'border-line text-muted hover:bg-white hover:text-ink'
          }`}
        >
          <span className={`grid size-5 place-items-center rounded-full text-xs ${s.id === step ? 'bg-plum-900 text-white' : 'bg-gold-100 text-plum-900'}`}>
            {i + 1}
          </span>
          {s.label}
        </button>
      ))}
    </nav>
  )
}

export function StepNav({ step, onStep }: { step: StepId; onStep: (s: StepId) => void }) {
  const i = STEPS.findIndex((s) => s.id === step)
  return (
    <div className="mt-6 flex justify-between border-t border-line pt-4">
      <Button type="button" variant="ghost" disabled={i === 0} onClick={() => onStep(STEPS[i - 1].id)}>← Back</Button>
      <Button type="button" disabled={i === STEPS.length - 1} onClick={() => onStep(STEPS[i + 1].id)}>Next →</Button>
    </div>
  )
}
