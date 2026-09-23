import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export function Login() {
  const { user, signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to="/" replace />

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const message = await signIn(email, password)
    if (message) setError(message)
    setBusy(false)
  }

  return (
    <div className="grid min-h-screen place-items-center bg-plum-900 p-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="font-display text-3xl text-plum-900">Evia</h1>
        <p className="mt-1 text-sm text-muted">Sign in to manage Evia Web and Evia Invites.</p>

        <label className="mt-6 block text-sm font-medium" htmlFor="email">Email</label>
        <input
          id="email" type="email" required autoComplete="email" value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm"
        />

        <label className="mt-4 block text-sm font-medium" htmlFor="password">Password</label>
        <input
          id="password" type="password" required autoComplete="current-password" value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm"
        />

        {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}

        <button
          disabled={busy}
          className="mt-6 w-full rounded-lg bg-gold-500 px-4 py-2.5 text-sm font-semibold text-plum-950 hover:bg-gold-400 disabled:opacity-60"
        >
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}