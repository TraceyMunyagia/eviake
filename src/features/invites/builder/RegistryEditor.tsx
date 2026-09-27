import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { TextInput } from '@/components/ui/Field'
import type { InviteContent } from '@/types/database'

type Registry = NonNullable<InviteContent['registries']>[number]

export function RegistryEditor({ items, onChange }: { items: Registry[]; onChange: (items: Registry[]) => void }) {
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')

  function add() {
    if (!name.trim()) return
    onChange([...items, { name: name.trim(), url: url.trim() || undefined }])
    setName(''); setUrl('')
  }

  function remove(index: number) {
    onChange(items.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-plum-900">Gift registries</p>
      {items.length > 0 && (
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li key={i} className="flex items-center gap-3 rounded-lg border border-line px-3 py-2 text-sm">
              <span className="flex-1">{item.name}{item.url ? ` — ${item.url}` : ''}</span>
              <button aria-label={`Remove ${item.name}`} onClick={() => remove(i)} className="text-muted hover:text-red-700"><Trash2 className="size-4" /></button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap items-end gap-2">
        <TextInput id="reg-name" label="Registry name" placeholder="Our Amazon list" value={name} onChange={(e) => setName(e.target.value)} />
        <div className="flex-1"><TextInput id="reg-url" label="Link (optional)" type="url" placeholder="https://" value={url} onChange={(e) => setUrl(e.target.value)} /></div>
        <Button type="button" variant="secondary" onClick={add}><Plus className="size-4" /> Add</Button>
      </div>
    </div>
  )
}