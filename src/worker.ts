function escapeHtml(str: string) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c] as string))
}

interface Env {
  VITE_SUPABASE_URL: string
  VITE_SUPABASE_ANON_KEY: string
  ASSETS: { fetch: typeof fetch }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const match = url.pathname.match(/^\/invite\/([^/]+)\/?$/)

    if (!match) {
      return env.ASSETS.fetch(request)
    }

    const slug = match[1]
    let title = "You're invited"
    let description = ''
    let image = ''

    try {
      const res = await fetch(`${env.VITE_SUPABASE_URL}/rest/v1/rpc/get_public_invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: env.VITE_SUPABASE_ANON_KEY,
          Authorization: `Bearer ${env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ p_slug: slug }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data) {
          title = data.content.couple_names || data.content.event_name || title
          description = [data.content.event_date, data.content.venue].filter(Boolean).join(' · ')
          image = data.content.hero_image_url || ''
        }
      }
    } catch {
      // Fall through to the defaults above — a missing preview beats a broken page.
    }

    const assetResponse = await env.ASSETS.fetch(new Request(new URL('/index.html', url), request))
    let html = await assetResponse.text()

    const tags = `
      <meta property="og:title" content="${escapeHtml(title)}" />
      <meta property="og:description" content="${escapeHtml(description)}" />
      ${image ? `<meta property="og:image" content="${escapeHtml(image)}" />` : ''}
      <meta property="og:type" content="website" />
      <meta property="og:url" content="${escapeHtml(request.url)}" />
      <meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}" />
      <meta name="twitter:title" content="${escapeHtml(title)}" />
      <meta name="twitter:description" content="${escapeHtml(description)}" />
      ${image ? `<meta name="twitter:image" content="${escapeHtml(image)}" />` : ''}
    `

    html = html.replace('</head>', `${tags}</head>`)
    html = html.replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`)

    return new Response(html, { headers: { 'content-type': 'text/html;charset=UTF-8' } })
  },
}