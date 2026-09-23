import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useBusiness } from '@/context/BusinessContext'

export function RequireAuth() {
  const { user, loading, signOut } = useAuth()
  const { businesses, loading: loadingBusinesses } = useBusiness()

  if (loading || loadingBusinesses) {
    return <p className="p-8 text-sm text-muted">Loading…</p>
  }
  if (!user) return <Navigate to="/login" replace />

  if (businesses.length === 0) {
    return (
      <div className="mx-auto mt-24 max-w-md rounded-2xl border border-line bg-white p-8 text-center">
        <h1 className="font-display text-2xl">No business access yet</h1>
        <p className="mt-2 text-sm text-muted">
          Your account is signed in but isn't linked to Evia Web or Evia Invites. Ask an owner to add you
          under business members.
        </p>
        <button onClick={signOut} className="mt-6 rounded-lg bg-plum-900 px-4 py-2 text-sm text-white">
          Sign out
        </button>
      </div>
    )
  }
  return <Outlet />
}