import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { STEPS, type StepId } from './BuilderSteps'

/** The step lives in the URL (?step=details), so a refresh stays on the same step. */
export function useBuilderStep(fallback: StepId): [StepId, (s: StepId) => void] {
  const [params, setParams] = useSearchParams()
  const raw = params.get('step')
  const step = (STEPS.some((s) => s.id === raw) ? raw : fallback) as StepId
  const setStep = useCallback(
    (s: StepId) => setParams((p) => { const n = new URLSearchParams(p); n.set('step', s); return n }, { replace: true }),
    [setParams],
  )
  return [step, setStep]
}
