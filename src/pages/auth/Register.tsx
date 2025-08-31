// import { useState } from 'react'
// import { useLocation, useNavigate } from 'react-router-dom'
// import { useAuth } from '../../context/AuthProvider'
// import GoogleButton from '../../components/auth/GoogleButton'

// export default function Register() {
//   const { register, googleSignIn } = useAuth()
//   const [name, setName] = useState('')
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [err, setErr] = useState<string | null>(null)
//   const nav = useNavigate()
//   const loc = useLocation()
//   const next = new URLSearchParams(loc.search).get('next') || '/me/enrollments'

//   async function onSubmit(e: React.FormEvent) {
//     e.preventDefault()
//     setErr(null)
//     try {
//       console.log(name,email,password)
//       await register({ name, email, password })
//       nav(next, { replace: true })
//     } catch (e: any) {
//       setErr(e?.response?.data?.message || e?.response?.data?.code || 'Registration failed')
//     }
//   }

//   async function onGoogleToken(idToken: string) {
//     setErr(null)
//     try {
//       await googleSignIn(idToken)
//       nav(next, { replace: true })
//     } catch (e: any) {
//       setErr(e?.response?.data?.message || 'Google sign-in failed')
//     }
//   }

//   return (
//     <div className="max-w-md mx-auto card p-6 space-y-4">
//       <h2 className="text-xl font-semibold">Create account</h2>
//       <form onSubmit={onSubmit} className="space-y-3">
//         <label className="block text-sm">
//           Name
//           <input className="mt-1 w-full border border-border rounded-md h-10 px-3" value={name} onChange={e=>setName(e.target.value)} />
//         </label>
//         <label className="block text-sm">
//           Email
//           <input className="mt-1 w-full border border-border rounded-md h-10 px-3" value={email} onChange={e=>setEmail(e.target.value)} />
//         </label>
//         <label className="block text-sm">
//           Password (min 8)
//           <input className="mt-1 w-full border border-border rounded-md h-10 px-3" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
//         </label>
//         {err && <div className="text-sm text-red-600">{err}</div>}
//         <button className="h-10 rounded-md bg-primary text-white w-full">Sign up</button>
//       </form>
//       {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
//         <>
//           <div className="text-center text-xs text-gray-500">or</div>
//           <GoogleButton onCredential={onGoogleToken} />
//         </>
//       )}
//     </div>
//   )
// }


import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthProvider';
import GoogleButton from '../../components/auth/GoogleButton';

function sanitizeNextParam(raw: string | null, fallback = '/me/enrollments') {
  // prevent open redirects; only allow same-origin path starting with '/'
  if (!raw) return fallback;
  try {
    // Disallow absolute URLs and query tricks
    if (raw.startsWith('/') && !raw.startsWith('//')) return raw;
  } catch {}
  return fallback;
}

export default function Register() {
  const { register, googleSignIn } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const nav = useNavigate();
  const loc = useLocation();

  const next = useMemo(
    () => sanitizeNextParam(new URLSearchParams(loc.search).get('next')),
    [loc.search]
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (password.trim().length < 8) {
      setErr('Password should be at least 8 characters.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setErr('Please enter a valid email address.');
      return;
    }
    setSubmitting(true);
    try {
      await register({ name: name.trim(), email: email.trim(), password: password });
      nav(next, { replace: true });
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.response?.data?.code || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  }

  async function onGoogleToken(idToken: string) {
    setErr(null);
    setSubmitting(true);
    try {
      await googleSignIn(idToken);
      nav(next, { replace: true });
    } catch (e: any) {
      setErr(e?.response?.data?.message || 'Google sign-in failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto card p-6 space-y-4">
      <h2 className="text-xl font-semibold">Create account</h2>
      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block text-sm">
          Name
          <input
            className="mt-1 w-full border border-border rounded-md h-10 px-3"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
          />
        </label>
        <label className="block text-sm">
          Email
          <input
            className="mt-1 w-full border border-border rounded-md h-10 px-3"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
        </label>
        <label className="block text-sm">
          Password (min 8)
          <input
            className="mt-1 w-full border border-border rounded-md h-10 px-3"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
            autoComplete="new-password"
          />
        </label>
        {err && <div className="text-sm text-red-600">{err}</div>}
        <button
          className="h-10 rounded-md bg-primary text-white w-full disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={submitting}
        >
          {submitting ? 'Creating account…' : 'Sign up'}
        </button>
      </form>

      {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
        <>
          <div className="text-center text-xs text-gray-500">or</div>
          <GoogleButton onCredential={onGoogleToken} disabled={submitting} />
        </>
      )}

      <p className="text-[11px] text-gray-500 text-center">
        By signing up, you agree to our Terms and Privacy Policy.
      </p>
    </div>
  );
}
