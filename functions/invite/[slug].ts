interface Env {
  VITE_SUPABASE_URL: string
  VITE_SUPABASE_ANON_KEY: string
  ASSETS: { fetch: typeof fetch }
}

interface InviteFunctionContext {
  request: Request
  env: Env
  params: Record<string, string | undefined>
}

type InvitePagesFunction = (
  context: InviteFunctionContext,
) => Response | Promise<Response>

type JsonRecord = Record<string, unknown>

function escapeHtml(value: unknown) {
  const str = String(value ?? '')
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c] as string))
}

function asRecord(value: unknown): JsonRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as JsonRecord
    : null
}

function nonEmptyString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : ''
}

export const onRequest: InvitePagesFunction = async (context) => {
  const { request, env, params } = context
  const slug = nonEmptyString(params.slug)

  let title = "You're invited"
  let description = 'Open this invitation to view the details and RSVP.'
  let imageUrl = ''
  let imageAlt = title

  if (slug && env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY) {
    try {
      const supabaseUrl = env.VITE_SUPABASE_URL.replace(/\/$/, '')
      const res = await fetch(`${supabaseUrl}/rest/v1/rpc/get_public_invite`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          apikey: env.VITE_SUPABASE_ANON_KEY,
          Authorization: `Bearer ${env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ p_slug: slug }),
      })

      if (res.ok) {
        const invite = asRecord(await res.json())
        const content = asRecord(invite?.content)

        if (content) {
          const names = nonEmptyString(content.couple_names)
          const eventName = nonEmptyString(content.event_name)
          const date = nonEmptyString(content.event_date)
          const venue = nonEmptyString(content.venue)
          const address = nonEmptyString(content.address)
          const heroImage = nonEmptyString(content.hero_image_url)

          title = names || eventName || title
          description = [date, venue || address].filter(Boolean).join(' · ') || description
          imageAlt = `${title} invitation`

          // Social crawlers require an absolute image URL. This also supports
          // storage URLs that are accidentally saved as relative paths.
          if (heroImage) imageUrl = new URL(heroImage, request.url).href
        }
      }
    } catch {
      // Keep the generic metadata if Supabase or the invite data is unavailable.
    }
  }

  const assetResponse = await env.ASSETS.fetch(new Request(new URL('/index.html', request.url)))
  if (!assetResponse.ok) return assetResponse

  let html = await assetResponse.text()
  const canonicalUrl = new URL(request.url)
  canonicalUrl.pathname = `/invite/${encodeURIComponent(slug)}`
  canonicalUrl.search = ''
  canonicalUrl.hash = ''

  const tags = `
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    ${imageUrl ? `<meta property="og:image" content="${escapeHtml(imageUrl)}" />` : ''}
    ${imageUrl ? `<meta property="og:image:alt" content="${escapeHtml(imageAlt)}" />` : ''}
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${escapeHtml(canonicalUrl.href)}" />
    <meta name="twitter:card" content="${imageUrl ? 'summary_large_image' : 'summary'}" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    ${imageUrl ? `<meta name="twitter:image" content="${escapeHtml(imageUrl)}" />` : ''}
    ${imageUrl ? `<meta name="twitter:image:alt" content="${escapeHtml(imageAlt)}" />` : ''}
    <link rel="canonical" href="${escapeHtml(canonicalUrl.href)}" />
  `

  html = html.replace(/<\/head>/i, `${tags}</head>`)
  html = html.replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`)

  return new Response(html, {
    headers: {
      'cache-control': 'public, max-age=0, s-maxage=300',
      'content-type': 'text/html;charset=UTF-8',
    },
  })
}
