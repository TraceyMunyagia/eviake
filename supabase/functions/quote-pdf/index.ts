// @ts-ignore Deno resolves this remote module when the Edge Function is bundled.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { buildQuotePdf, type QuoteDoc } from './pdf.ts'

declare const Deno: {
  env: { get(name: string): string | undefined }
  serve(handler: (request: Request) => Response | Promise<Response>): void
}

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

function fail(status: number, message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'GET') return fail(405, 'Use GET')

  const url = new URL(req.url)
  const token = url.searchParams.get('token')
  const id = url.searchParams.get('id')
  if (!token && !id) return fail(400, 'Provide a token or an id')

  const headers: Record<string, string> = {}
  const auth = req.headers.get('Authorization')
  if (auth) headers.Authorization = auth

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')
  if (!supabaseUrl || !supabaseKey) return fail(500, 'Supabase function is not configured')

  const supabase = createClient(supabaseUrl, supabaseKey, {
    global: { headers },
  })

  // Public link: only sent, accepted or rejected quotes.
  // Signed-in link: any quote the user's business membership allows.
  const { data, error } = token
    ? await supabase.rpc('get_public_quote', { p_token: token })
    : await supabase.rpc('get_quote_document', { p_id: id })

  if (error) return fail(500, 'Could not load the quote')
  if (!data) return fail(404, 'Quote not found')

  try {
    const doc = data as QuoteDoc
    const bytes = await buildQuotePdf(doc)
    const name = `Q-${String(doc.quote_no).padStart(4, '0')}.pdf`

    return new Response(bytes as unknown as BodyInit, {
      headers: {
        ...cors,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${name}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('quote-pdf generation failed', error)
    return fail(500, 'Could not generate the PDF')
  }
})
