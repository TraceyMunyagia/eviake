import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { TextInput } from '@/components/ui/Field'
import type { InviteContent } from '@/types/database'

type ScheduleItem = NonNullable<InviteContent['schedule']>[number]

export function ScheduleEditor({ items, onChange }: {
  items: ScheduleItem[]
  onChange: (items: ScheduleItem[]) => void
}) {
  const [time, setTime] = useState('')
  const [label, setLabel] = useState('')

  function add() {
    if (!time.trim() || !label.trim()) return
    onChange([...items, { time: time.trim(), label: label.trim() }])
    setTime('')
    setLabel('')
  }

  function remove(index: number) {
    onChange(items.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-plum-900">Schedule</p>
      {items.length > 0 && (
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li key={i} className="flex items-center gap-3 rounded-lg border border-line px-3 py-2 text-sm">
              <span className="w-16 shrink-0 font-medium">{item.time}</span>
              <span className="flex-1">{item.label}</span>
              <button aria-label={`Remove ${item.label}`} onClick={() => remove(i)} className="text-muted hover:text-red-700"><Trash2 className="size-4" /></button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap items-end gap-2">
        <TextInput id="sch-time" label="Time" placeholder="4:00 PM" value={time} onChange={(e) => setTime(e.target.value)} />
        <div className="flex-1"><TextInput id="sch-label" label="What happens" placeholder="Ceremony begins" value={label} onChange={(e) => setLabel(e.target.value)} /></div>
        <Button type="button" variant="secondary" onClick={add}><Plus className="size-4" /> Add</Button>
      </div>
    </div>
  )
}