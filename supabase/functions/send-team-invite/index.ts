// Edge Function: creates a membership_invites row and returns the invite link.
// Deploy with: supabase functions deploy send-team-invite
// @ts-ignore Deno resolves this remote module when the Edge Function is bundled.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

declare const Deno: {
  env: { get(name: string): string | undefined }
  serve(handler: (request: Request) => Response | Promise<Response>): void
}
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ error: 'Use POST' }, 405)

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const appUrl = Deno.env.get('APP_URL')
  if (!supabaseUrl || !anonKey || !serviceRoleKey || !appUrl) {
    return json({ error: 'Invite service is not configured' }, 500)
  }

  const authorization = req.headers.get('Authorization')
  if (!authorization?.startsWith('Bearer ')) return json({ error: 'Authentication required' }, 401)

  const token = authorization.slice('Bearer '.length)
  const authClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
  })
  const { data: authData, error: authError } = await authClient.auth.getUser(token)
  if (authError || !authData.user) return json({ error: 'Authentication required' }, 401)

  let body: { business_id?: unknown; email?: unknown; role?: unknown }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Request body must be valid JSON' }, 400)
  }

  const businessId = typeof body.business_id === 'string' ? body.business_id.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const role = body.role === 'owner' || body.role === 'member' ? body.role : 'member'
  if (!businessId || !email || !/^\S+@\S+\.\S+$/.test(email)) {
    return json({ error: 'business_id and a valid email are required' }, 400)
  }

  const admin = createClient(supabaseUrl, serviceRoleKey)
  const { data: membership, error: membershipError } = await admin
    .from('business_members')
    .select('user_id')
    .eq('business_id', businessId)
    .eq('user_id', authData.user.id)
    .maybeSingle()
  if (membershipError) return json({ error: membershipError.message }, 500)
  if (!membership) return json({ error: 'You are not a member of this business' }, 403)

  const inviteToken = crypto.randomUUID()
  const { data: invite, error: insertError } = await admin
    .from('membership_invites')
    .insert({ business_id: businessId, email, role, invited_by: authData.user.id, token: inviteToken })
    .select('*')
    .single()
  if (insertError) return json({ error: insertError.message }, 400)

  // Plug in a transactional email provider here when email delivery is wired up.
  const link = `${appUrl.replace(/\/$/, '')}/accept-invite/${inviteToken}`
  return json({ invite, link })
})
