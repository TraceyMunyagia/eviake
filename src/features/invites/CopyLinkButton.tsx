import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

export function CopyLinkButton({ url, label }: { url: string; label: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }}
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-line bg-white px-3 py-1.5 text-sm hover:bg-gold-100"
    >
      {copied ? <Check className="size-4 text-green-800" /> : <Copy className="size-4" />}
      {copied ? 'Copied' : label}
    </button>
  )
}
