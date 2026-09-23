export function formatKES(value: number | string | null | undefined) {
  const n = Number(value ?? 0)
  return `KSh ${n.toLocaleString('en-KE', { maximumFractionDigits: 0 })}`
}

export function formatDate(value: string | null | undefined) {
  if (!value) return '–'
  return new Date(value).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })
}
export function formatOrderNo(n: number) {
  return `#${String(n).padStart(4, '0')}`
}

export function formatDateTime(value: string) {
  return new Date(value).toLocaleString('en-KE', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

export const METHOD_LABELS: Record<string, string> = {
  mpesa: 'M-Pesa', bank: 'Bank transfer', cash: 'Cash', other: 'Other',
}