import { DateField, TextField, TimeField } from '../fields/Fields'
import { P } from '../content/contentPaths'

export function EventDetailsPanel() {
  return (
    <div className="space-y-4">
      <TextField path={P.eventType} label="Event type" placeholder="e.g. Wedding, Graduation party" />
      <div className="grid gap-4 sm:grid-cols-2">
        <DateField path={P.date} label="Date" />
        <TimeField path={P.time} label="Start time" />
      </div>
      <p className="text-xs text-muted">The venue is edited in the Location section.</p>
    </div>
  )
}
