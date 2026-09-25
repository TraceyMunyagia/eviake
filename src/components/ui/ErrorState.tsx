import { AlertCircle, RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
      <AlertCircle className="size-6 text-red-600" />
      <p className="text-sm text-red-800">{message}</p>
      <Button variant="secondary" onClick={onRetry} className="mt-1"><RotateCw className="size-4" /> Try again</Button>
    </div>
  )
}