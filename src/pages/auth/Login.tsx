import { useEffect, useState } from 'react'  // ⬅️ add useEffect
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthProvider'
import GoogleButton from '../../components/auth/GoogleButton'

export default function Login() {
  const { login, googleSignIn, user, loading } = useAuth(); // ⬅️ get user & loading

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const nav = useNavigate()
  const loc = useLocation()
  const next = new URLSearchParams(loc.search).get('next') || '/me/enrollments'

  // ⬇️ if already logged in, leave /login immediately
  useEffect(() => {
    if (!loading && user) {
      nav(next, { replace: true })
    }
  }, [loading, user, next, nav])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    try {
      await login({ email, password })
      nav(next, { replace: true })
    } catch (e: any) {
      setErr(e?.response?.data?.message || 'Login failed')
    }
  }

  async function onGoogleToken(idToken: string) {
    setErr(null)
    try {
      await googleSignIn(idToken)
      nav(next, { replace: true })
    } catch (e: any) {
      setErr(e?.response?.data?.message || 'Google sign-in failed')
    }
  }

  // optional: while we check auth, show nothing (prevents flicker)
  if (loading) return null;

  return (
    <div className="max-w-md mx-auto card p-6 space-y-4">
      <h2 className="text-xl font-semibold">Log in</h2>
      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block text-sm">
          Email
          <input className="mt-1 w-full border border-border rounded-md h-10 px-3" value={email} onChange={e=>setEmail(e.target.value)} />
        </label>
        <label className="block text-sm">
          Password
          <input className="mt-1 w-full border border-border rounded-md h-10 px-3" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        </label>
        {err && <div className="text-sm text-red-600">{err}</div>}
        <button className="h-10 rounded-md bg-primary text-white w-full">Continue</button>
      </form>
      {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
        <>
          <div className="text-center text-xs text-gray-500">or</div>
          <GoogleButton onCredential={onGoogleToken} />
        </>
      )}
    </div>
  )
}
