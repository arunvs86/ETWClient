// import { useEffect, useState } from 'react'
// import { Link, useNavigate, useParams } from 'react-router-dom'
// import { getQuizBySlug, startAttempt } from '@/lib/publicQuizzes.api'
// import { useAuth } from '@/context/AuthProvider'

// export default function PublicQuizViewPage() {
//   const { slug = '' } = useParams()
//   const nav = useNavigate()
//   const { user } = useAuth()

//   const [loading, setLoading] = useState(true)
//   const [err, setErr] = useState<string | null>(null)
//   const [data, setData] = useState<Awaited<ReturnType<typeof getQuizBySlug>> | null>(null)
//   const [busy, setBusy] = useState(false)

//   useEffect(() => {
//     (async () => {
//       try {
//         setLoading(true)
//         const resp = await getQuizBySlug(slug)
//         setData(resp)
//       } catch (e: any) {
//         setErr(e?.response?.data?.message || 'Failed to load quiz')
//       } finally {
//         setLoading(false)
//       }
//     })()
//   }, [slug])

//   async function onStart() {
//     if (!data) return
//     if (data.quiz.visibility === 'enrolled' && !user) {
//       nav('/login', { state: { redirectTo: `/quizzes/${slug}` } })
//       return
//     }
//     try {
//       setBusy(true)
//       const resp = await startAttempt(slug)
//       localStorage.setItem(`quizAttempt:${slug}`, resp.attempt.id)
//       nav(`/quizzes/${slug}/play`, { state: resp })
//     } catch (e: any) {
//       const msg = e?.response?.data?.message || 'Could not start attempt'
//       setErr(msg)
//       // if backend sends 402 / membership required → redirect CTA
//       if (e?.response?.status === 402) {
//         nav('/billing/plans', { state: { redirectTo: `/quizzes/${slug}` } })
//       }
//     }
//   }

//   if (loading) return <div className="mx-auto max-w-3xl p-6"><div className="h-32 animate-pulse rounded-lg bg-gray-100" /></div>
//   if (err) return <div className="mx-auto max-w-3xl p-6 rounded-md border border-red-200 bg-red-50 p-4 text-red-700">{err}</div>
//   if (!data) return null

//   const q = data.quiz

//   return (
//     <div className="mx-auto max-w-3xl p-6 space-y-4">
//       <h1 className="text-2xl font-semibold">{q.title}</h1>
//       {q.description && <p className="text-gray-700">{q.description}</p>}

//       <div className="rounded-xl border bg-white p-4">
//         <div className="text-sm text-gray-700">
//           <div>Questions: <span className="font-medium">{q.questionCount}</span></div>
//           <div>Total points: <span className="font-medium">{q.totalPoints}</span></div>
//           <div>Pass mark: <span className="font-medium">{q.passPercent}%</span></div>
//           <div>Attempts allowed: <span className="font-medium">{q.attemptsAllowed}</span></div>
//           <div>Time limit: <span className="font-medium">{q.timeLimitSec ? `${q.timeLimitSec}s` : 'No limit'}</span></div>
//           <div>Visibility: <span className="font-medium">{q.visibility === 'public' ? 'Public' : 'Login required'}</span></div>

//           {q.pricing.isFree ? (
//     <div>Price: <span className="font-medium">Free</span></div>
//   ) : q.pricing.includedInMembership ? (
//     <div>Price: <span className="font-medium">Included in Membership</span></div>
//   ) : (
//     <div>Price: <span className="font-medium">
//       {(q.pricing.amountMinor/100).toFixed(2)} {q.pricing.currency}
//     </span></div>
//   )}

//         </div>



//         <div className="mt-4 flex items-center gap-3">
//           <button
//             onClick={onStart}
//             disabled={busy}
//             className="rounded-md bg-primary px-4 py-2 text-sm text-white"
//           >
//             {busy ? 'Starting…' : 'Start quiz'}
//           </button>
//           <Link className="text-sm underline" to="/quizzes">Back to all quizzes</Link>
//         </div>
//       </div>
//     </div>
//   )
// }

import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getQuizBySlug, startAttempt, createQuizCheckout } from '@/lib/publicQuizzes.api'
import { useAuth } from '@/context/AuthProvider'

export default function PublicQuizViewPage() {
  const { slug = '' } = useParams()
  const nav = useNavigate()
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)
  const [data, setData] = useState<Awaited<ReturnType<typeof getQuizBySlug>> | null>(null)
  const [busy, setBusy] = useState(false)

  // fetch quiz
  useEffect(() => {
    (async () => {
      try {
        setLoading(true)
        const resp = await getQuizBySlug(slug)
        setData(resp)
        setErr(null)
      } catch (e: any) {
        setErr(e?.response?.data?.message || 'Failed to load quiz')
      } finally {
        setLoading(false)
      }
    })()
  }, [slug])

  // ---- derive values WITHOUT hooks (so hooks order never changes)
  const q = data?.quiz ?? null
  const pricing = q?.pricing ?? {
    isFree: false,
    includedInMembership: false,
    amountMinor: 0,
    currency: 'GBP' as const,
  }

  const ent = data?.entitlement ?? {
    isFree: pricing.isFree,
    includedInMembership: pricing.includedInMembership,
    memberActive: false,
    purchased: false,
    canStart: pricing.isFree,
  }

  const isPaidOnly = !ent.isFree && !ent.includedInMembership
  const canStart = !!ent.canStart
  const showBuy = isPaidOnly && !ent.purchased

  const priceLabel = pricing.isFree
    ? 'Free'
    : pricing.includedInMembership
      ? 'Included in Membership'
      : `${(pricing.amountMinor / 100).toFixed(2)} ${pricing.currency}`

  async function startOrCheckout() {
    if (!q) return

    // enrolled visibility requires login
    if (q.visibility === 'enrolled' && !user) {
      nav('/login', { state: { redirectTo: `/quizzes/${slug}` } })
      return
    }

    try {
      setBusy(true)

      if (canStart) {
        const resp = await startAttempt(slug)
        localStorage.setItem(`quizAttempt:${slug}`, resp.attempt.id)
        nav(`/quizzes/${slug}/play`, { state: resp })
        return
      }

      if (ent.includedInMembership && !ent.memberActive) {
        // needs membership
        nav('/billing/plans', { state: { redirectTo: `/quizzes/${slug}` } })
        return
      }

      if (showBuy) {
        // paid-only → checkout
        try {
          const { checkoutUrl } = await createQuizCheckout(slug)
          window.location.href = checkoutUrl
          return
        } catch (e: any) {
          // if backend says already purchased, just start
          const msg = e?.response?.data?.error || e?.response?.data?.message || ''
          if (e?.response?.status === 400 && /already purchased/i.test(msg)) {
            const resp = await startAttempt(slug)
            localStorage.setItem(`quizAttempt:${slug}`, resp.attempt.id)
            nav(`/quizzes/${slug}/play`, { state: resp })
            return
          }
          throw e
        }
      }

      // last resort try
      const resp = await startAttempt(slug)
      localStorage.setItem(`quizAttempt:${slug}`, resp.attempt.id)
      nav(`/quizzes/${slug}/play`, { state: resp })
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Could not start'
      setErr(msg)
      if (e?.response?.status === 402 && ent.includedInMembership) {
        nav('/billing/plans', { state: { redirectTo: `/quizzes/${slug}` } })
      }
    } finally {
      setBusy(false)
    }
  }

  // ---- render (no hooks below this line)
  if (loading) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="h-32 animate-pulse rounded-lg bg-gray-100" />
      </div>
    )
  }
  if (err) {
    return (
      <div className="mx-auto max-w-3xl p-6 rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
        {err}
      </div>
    )
  }
  if (!q) return null

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-4">
      <h1 className="text-2xl font-semibold">{q.title}</h1>
      {q.description && <p className="text-gray-700">{q.description}</p>}

      <div className="rounded-xl border bg-white p-4">
        <div className="text-sm text-gray-700">
          <div>Questions: <span className="font-medium">{q.questionCount}</span></div>
          <div>Total points: <span className="font-medium">{q.totalPoints}</span></div>
          <div>Pass mark: <span className="font-medium">{q.passPercent}%</span></div>
          <div>Attempts allowed: <span className="font-medium">{q.attemptsAllowed}</span></div>
          <div>Time limit: <span className="font-medium">{q.timeLimitSec ? `${q.timeLimitSec}s` : 'No limit'}</span></div>
          <div>Visibility: <span className="font-medium">{q.visibility === 'public' ? 'Public' : 'Login required'}</span></div>
          <div>Price: <span className="font-medium">{priceLabel}</span></div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={startOrCheckout}
            disabled={busy}
            className="rounded-md bg-primary px-4 py-2 text-sm text-white"
          >
            {busy
              ? (showBuy ? 'Redirecting…' : 'Starting…')
              : canStart
                ? 'Start quiz'
                : ent.includedInMembership
                  ? 'Start (membership)'
                  : `Buy • ${priceLabel}`}
          </button>
          <Link className="text-sm underline" to="/quizzes">Back to all quizzes</Link>
        </div>
      </div>
    </div>
  )
}
