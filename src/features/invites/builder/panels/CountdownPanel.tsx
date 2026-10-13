import { SwitchField, TextField } from '../fields/Fields'
import { P } from '../content/contentPaths'

export function CountdownPanel() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">The countdown runs to the date and time in Event details.</p>
      <SwitchField path={P.countdownSeconds} label="Show seconds" />
      <TextField path={P.countdownDone} label="Message when the event starts" placeholder="Today is the day!" />
    </div>
  )
}
