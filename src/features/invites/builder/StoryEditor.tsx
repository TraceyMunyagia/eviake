import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { TextInput, TextArea } from '@/components/ui/Field'
import type { InviteContent } from '@/types/database'

type StoryItem = NonNullable<InviteContent['story_items']>[number]

export function StoryEditor({ items, onChange }: { items: StoryItem[]; onChange: (items: StoryItem[]) => void }) {
  const [date, setDate] = useState('')
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')

  function add() {
    if (!title.trim()) return
    onChange([...items, { date: date.trim() || undefined, title: title.trim(), text: text.trim() || undefined }])
    setDate(''); setTitle(''); setText('')
  }

  function remove(index: number) {
    onChange(items.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-plum-900">Our story</p>
      {items.length > 0 && (
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 rounded-lg border border-line px-3 py-2 text-sm">
              <div className="flex-1">
                {item.date && <p className="text-xs text-muted">{item.date}</p>}
                <p className="font-medium">{item.title}</p>
                {item.text && <p className="text-muted">{item.text}</p>}
              </div>
              <button aria-label={`Remove ${item.title}`} onClick={() => remove(i)} className="text-muted hover:text-red-700"><Trash2 className="size-4" /></button>
            </li>
          ))}
        </ul>
      )}
      <div className="space-y-2 rounded-lg border border-dashed border-line p-3">
        <div className="grid gap-2 sm:grid-cols-2">
          <TextInput id="story-date" label="Date/moment (optional)" placeholder="Summer 2023" value={date} onChange={(e) => setDate(e.target.value)} />
          <TextInput id="story-title" label="Title" placeholder="How we met" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <TextArea id="story-text" label="Short description" value={text} onChange={(e) => setText(e.target.value)} />
        <Button type="button" variant="secondary" onClick={add}><Plus className="size-4" /> Add moment</Button>
      </div>
    </div>
  )
}