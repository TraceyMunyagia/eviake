import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { TextInput } from '@/components/ui/Field'

type LinkItem = { name: string; url?: string }

export function RegistryEditor({
  items,
  onChange,
  title = 'Gift registries',
  nameLabel = 'Registry name',
  namePlaceholder = 'Our Amazon list',
  idPrefix = 'reg',
}: {
  items: LinkItem[]
  onChange: (items: LinkItem[]) => void
  title?: string
  nameLabel?: string
  namePlaceholder?: string
  idPrefix?: string // keeps input ids unique when the editor appears twice
}) {
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
      <p className="text-sm font-medium text-plum-900">{title}</p>
      {items.length > 0 && (
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li key={i} className="flex items-center gap-3 rounded-lg border border-line px-3 py-2 text-sm">
              <span className="flex-1">{item.name}{item.url ? `: ${item.url}` : ''}</span>
              <button aria-label={`Remove ${item.name}`} onClick={() => remove(i)} className="text-muted hover:text-red-700"><Trash2 className="size-4" /></button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap items-end gap-2">
        <TextInput id={`${idPrefix}-name`} label={nameLabel} placeholder={namePlaceholder} value={name} onChange={(e) => setName(e.target.value)} />
        <div className="flex-1"><TextInput id={`${idPrefix}-url`} label="Link" type="url" placeholder="https://" value={url} onChange={(e) => setUrl(e.target.value)} /></div>
        <Button type="button" variant="secondary" onClick={add}><Plus className="size-4" /> Add</Button>
      </div>
    </div>
  )
}