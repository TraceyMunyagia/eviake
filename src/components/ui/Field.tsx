import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export const inputClass =
  'mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-muted/70'

export function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium">{label}</label>
      {children}
    </div>
  )
}

export function TextInput({ label, id, className, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; id: string }) {
  return (
    <Field label={label} htmlFor={id}>
      <input id={id} {...props} className={cn(inputClass, className)} />
    </Field>
  )
}

export function TextArea({ label, id, className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; id: string }) {
  return (
    <Field label={label} htmlFor={id}>
      <textarea id={id} rows={3} {...props} className={cn(inputClass, className)} />
    </Field>
  )
}