// @ts-ignore Deno resolves this remote module when the Edge Function is bundled.
import { PDFDocument, StandardFonts, rgb } from 'https://esm.sh/pdf-lib@1.17.1'

export type QuoteDoc = {
  quote_no: number
  status: string
  valid_until: string | null
  created_at: string
  sent_at: string | null
  subtotal_kes: number
  discount_kes: number
  total_kes: number
  care_name: string | null
  monthly_kes: number
  notes: string | null
  business_name: string
  client_name: string
  client_business_name: string | null
  items: { kind: string; name: string; description: string | null; quantity: number; unit_price_kes: number }[]
}

const PLUM = rgb(0.169, 0.09, 0.192)
const GOLD = rgb(0.788, 0.643, 0.416)
const INK = rgb(0.165, 0.102, 0.18)
const MUTED = rgb(0.478, 0.42, 0.49)
const LINE = rgb(0.91, 0.878, 0.827)

const W = 595.28
const H = 841.89
const M = 48

// Standard PDF fonts only cover a limited Latin character set.
function safe(text: string): string {
  return Array.from(text, (character) => {
    if (character === '‘' || character === '’') return "'"
    if (character === '“' || character === '”') return '"'

    const code = character.charCodeAt(0)
    return code >= 0x20 && code <= 0x7e ? character : '?'
  }).join('')
}

function money(n: number) {
  return 'KSh ' + String(Math.round(Number(n))).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

function pad(n: number) {
  return `Q-${String(n).padStart(4, '0')}`
}

function fmtDate(value: string | null) {
  if (!value) return '-'
  // Parse date-only values as Nairobi calendar dates rather than UTC midnight.
  const d = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T12:00:00+03:00`)
    : new Date(value)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Africa/Nairobi' })
}

function wrap(text: string, font: any, size: number, maxWidth: number) {
  const lines: string[] = []
  for (const para of text.split('\n')) {
    let line = ''
    for (const word of safe(para).split(/\s+/).filter(Boolean)) {
      const test = line ? `${line} ${word}` : word
      if (font.widthOfTextAtSize(test, size) <= maxWidth) line = test
      else {
        if (line) lines.push(line)
        line = word
        // Keep unusually long unbroken values inside the page width.
        while (line.length > 1 && font.widthOfTextAtSize(line, size) > maxWidth) {
          const split = Math.max(1, line.length - 1)
          lines.push(line.slice(0, split))
          line = line.slice(split)
        }
      }
    }
    lines.push(line)
  }
  return lines
}

export async function buildQuotePdf(q: QuoteDoc): Promise<Uint8Array> {
  const pdf = await PDFDocument.create()
  const regular = await pdf.embedFont(StandardFonts.Helvetica)
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold)
  const serif = await pdf.embedFont(StandardFonts.TimesRomanBold)

  let page: any = pdf.addPage([W, H])
  let y = H

  const text = (s: string, x: number, size = 10, font = regular, color = INK) =>
    page.drawText(safe(s), { x, y, size, font, color })
  const right = (s: string, xRight: number, size = 10, font = regular, color = INK) => {
    const t = safe(s)
    page.drawText(t, { x: xRight - font.widthOfTextAtSize(t, size), y, size, font, color })
  }
  const rule = (color = LINE) =>
    page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 0.7, color })

  function header() {
    page.drawRectangle({ x: 0, y: H - 96, width: W, height: 96, color: PLUM })
    y = H - 58
    text('EVIA', M, 26, serif, GOLD)
    y = H - 40
    right('QUOTATION', W - M, 10, bold, GOLD)
    y = H - 62
    right(pad(q.quote_no), W - M, 20, bold, rgb(1, 1, 1))
    y = H - 96 - 34
  }

  function newPage() {
    page = pdf.addPage([W, H])
    y = H - M
  }

  function ensure(space: number) {
    if (y - space < M + 30) newPage()
  }

  header()

  // Prepared for / dates
  const top = y
  text('PREPARED FOR', M, 8, bold, MUTED)
  y -= 16
  text(q.client_name, M, 13, bold)
  if (q.client_business_name) {
    y -= 15
    text(q.client_business_name, M, 10, regular, MUTED)
  }
  const leftBottom = y

  y = top
  const labelX = W - M - 170
  for (const [label, value] of [
    ['Issued', fmtDate(q.sent_at ?? q.created_at)],
    ['Valid until', fmtDate(q.valid_until)],
    ['From', q.business_name],
  ] as const) {
    text(label, labelX, 9, regular, MUTED)
    right(value, W - M, 10, bold)
    y -= 16
  }
  y = Math.min(leftBottom, y) - 26

  // Items table
  const colQty = W - M - 200
  const colPrice = W - M - 100
  const colAmt = W - M
  rule(INK)
  y -= 16
  text('DESCRIPTION', M, 8, bold, MUTED)
  right('QTY', colQty, 8, bold, MUTED)
  right('UNIT PRICE', colPrice, 8, bold, MUTED)
  right('AMOUNT', colAmt, 8, bold, MUTED)
  y -= 10
  rule()

  for (const item of q.items) {
    const descLines = item.description ? wrap(item.description, regular, 9, colQty - M - 60) : []
    ensure(30 + descLines.length * 12)
    y -= 18
    text(item.name, M, 10.5, bold)
    right(String(item.quantity), colQty, 10)
    right(money(item.unit_price_kes), colPrice, 10)
    right(money(item.quantity * item.unit_price_kes), colAmt, 10, bold)
    for (const line of descLines) {
      y -= 12
      text(line, M, 9, regular, MUTED)
    }
    y -= 10
    rule()
  }

  // Totals
  ensure(140)
  const totalsLabelX = W - M - 220
  const row = (label: string, value: string, strong = false) => {
    y -= 20
    text(label, totalsLabelX, strong ? 11 : 10, strong ? bold : regular, strong ? INK : MUTED)
    right(value, colAmt, strong ? 12 : 10, strong ? bold : regular)
  }
  row('Subtotal', money(q.subtotal_kes))
  if (Number(q.discount_kes) > 0) row('Discount', '- ' + money(q.discount_kes))
  y -= 8
  page.drawLine({ start: { x: totalsLabelX, y }, end: { x: colAmt, y }, thickness: 1, color: GOLD })
  row('Website setup', money(q.total_kes), true)

  if (Number(q.monthly_kes) > 0) {
    y -= 8
    row('Monthly care', money(q.monthly_kes) + ' / month', true)
    if (q.care_name) {
      y -= 12
      text(q.care_name, totalsLabelX, 8.5, regular, MUTED)
    }
  }

  // Notes
  if (q.notes && q.notes.trim()) {
    const lines = wrap(q.notes, regular, 9.5, W - 2 * M)
    ensure(50 + lines.length * 13)
    y -= 34
    text('NOTES', M, 8, bold, MUTED)
    for (const line of lines) {
      y -= 13
      text(line, M, 9.5)
    }
  }

  // Footer on every page
  const pages = pdf.getPages()
  for (let i = 0; i < pages.length; i += 1) {
    const p = pages[i]
    p.drawLine({ start: { x: M, y: 44 }, end: { x: W - M, y: 44 }, thickness: 0.7, color: LINE })
    p.drawText(safe(`${q.business_name}  |  ${pad(q.quote_no)}`), { x: M, y: 30, size: 8, font: regular, color: MUTED })
    const label = `Page ${i + 1} of ${pages.length}`
    p.drawText(label, { x: W - M - regular.widthOfTextAtSize(label, 8), y: 30, size: 8, font: regular, color: MUTED })
  }

  return await pdf.save()
}
