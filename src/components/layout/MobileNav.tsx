import { Menu } from 'lucide-react'

export function MobileNav({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      aria-label="Open navigation"
      onClick={onOpen}
      className="rounded-lg p-2 hover:bg-white/10 lg:hidden"
    >
      <Menu className="size-5" />
    </button>
  )
}
