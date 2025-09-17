// // src/pages/quizzes/PublicQuizViewPage.tsx
// import { useEffect, useState } from 'react'
// import { Link, useNavigate, useParams } from 'react-router-dom'
// import { getQuizBySlug, startAttempt, createQuizCheckout } from '@/lib/publicQuizzes.api'
// import { useAuth } from '@/context/AuthProvider'
// import {
//   Trophy,
//   Clock,
//   ListChecks,
//   ShieldCheck,
//   Lock,
//   Sparkles,
// } from 'lucide-react'

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
//         setErr(null)
//       } catch (e: any) {
//         setErr(e?.response?.data?.message || 'Failed to load quiz')
//       } finally {
//         setLoading(false)
//       }
//     })()
//   }, [slug])

//   const q = data?.quiz ?? null
//   const pricing = q?.pricing ?? {
//     isFree: false,
//     includedInMembership: false,
//     amountMinor: 0,
//     currency: 'GBP' as const,
//   }

//   const ent = data?.entitlement ?? {
//     isFree: pricing.isFree,
//     includedInMembership: pricing.includedInMembership,
//     memberActive: false,
//     purchased: false,
//     canStart: pricing.isFree,
//   }

//   const isPaidOnly = !ent.isFree && !ent.includedInMembership
//   const canStart = !!ent.canStart
//   const showBuy = isPaidOnly && !ent.purchased

//   const priceLabel = pricing.isFree
//     ? 'Free'
//     : pricing.includedInMembership
//       ? 'Included in Membership'
//       : `${(pricing.amountMinor / 100).toFixed(2)} ${pricing.currency}`

//   async function startOrCheckout() {
//     if (!q) return
//     if (q.visibility === 'enrolled' && !user) {
//       nav('/login', { state: { redirectTo: `/quizzes/${slug}` } })
//       return
//     }
//     try {
//       setBusy(true)
//       if (canStart) {
//         const resp = await startAttempt(slug)
//         localStorage.setItem(`quizAttempt:${slug}`, resp.attempt.id)
//         nav(`/quizzes/${slug}/play`, { state: resp })
//         return
//       }
//       if (ent.includedInMembership && !ent.memberActive) {
//         nav('/billing/plans', { state: { redirectTo: `/quizzes/${slug}` } })
//         return
//       }
//       if (showBuy) {
//         try {
//           const { checkoutUrl } = await createQuizCheckout(slug)
//           window.location.href = checkoutUrl
//           return
//         } catch (e: any) {
//           const msg = e?.response?.data?.error || e?.response?.data?.message || ''
//           if (e?.response?.status === 400 && /already purchased/i.test(msg)) {
//             const resp = await startAttempt(slug)
//             localStorage.setItem(`quizAttempt:${slug}`, resp.attempt.id)
//             nav(`/quizzes/${slug}/play`, { state: resp })
//             return
//           }
//           throw e
//         }
//       }
//       const resp = await startAttempt(slug)
//       localStorage.setItem(`quizAttempt:${slug}`, resp.attempt.id)
//       nav(`/quizzes/${slug}/play`, { state: resp })
//     } catch (e: any) {
//       const msg = e?.response?.data?.message || 'Could not start'
//       setErr(msg)
//       if (e?.response?.status === 402 && ent.includedInMembership) {
//         nav('/billing/plans', { state: { redirectTo: `/quizzes/${slug}` } })
//       }
//     } finally {
//       setBusy(false)
//     }
//   }

//   if (loading) {
//     return (
//       <div className="mx-auto max-w-3xl p-6 space-y-4">
//         <div className="h-36 animate-pulse rounded-2xl bg-gray-100" />
//         <div className="grid gap-3 sm:grid-cols-2">
//           <div className="h-24 animate-pulse rounded-xl bg-gray-100" />
//           <div className="h-24 animate-pulse rounded-xl bg-gray-100" />
//         </div>
//       </div>
//     )
//   }
//   if (err) {
//     return (
//       <div className="mx-auto max-w-3xl p-6 rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
//         {err}
//       </div>
//     )
//   }
//   if (!q) return null

//   const visibilityPill =
//     q.visibility === 'public'
//       ? <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">Public</span>
//       : <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700"><Lock size={14}/> Login required</span>

//   const pricePill = (
//     <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
//       {priceLabel}
//     </span>
//   )

//   return (
//     <div className="mx-auto max-w-3xl p-6 space-y-6">
//       {/* Hero */}
//       <div className="overflow-hidden rounded-2xl border bg-gradient-to-br from-white to-gray-50 shadow-sm">
//         <div className="relative p-5">
//           <div className="absolute right-4 top-4 hidden rotate-6 sm:block">
//             <Sparkles className="opacity-20" size={48} />
//           </div>

//           <div className="flex items-start justify-between gap-3">
//             <div className="min-w-0">
//               <div className="mb-2 flex flex-wrap items-center gap-2">
//                 {visibilityPill}
//                 {pricePill}
//                 <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
//                   {q.timeLimitSec ? `${q.timeLimitSec}s limit` : 'No time limit'}
//                 </span>
//               </div>
//               <h1 className="truncate text-2xl font-semibold">{q.title}</h1>
//               {q.description && (
//                 <p className="mt-1 text-gray-700">
//                   {q.description}
//                 </p>
//               )}
//             </div>

//             <button
//               onClick={startOrCheckout}
//               disabled={busy}
//               className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:shadow disabled:opacity-60"
//             >
//               {busy
//                 ? (showBuy ? 'Redirecting…' : 'Starting…')
//                 : canStart
//                   ? 'Start quiz'
//                   : ent.includedInMembership
//                     ? 'Start (membership)'
//                     : `Buy • ${priceLabel}`}
//             </button>
//           </div>

//           {/* Stat strip */}
//           <div className="mt-4 grid gap-2 sm:grid-cols-4">
//             <StatPill icon={<ListChecks size={16} />} label="Questions" value={q.questionCount} />
//             <StatPill icon={<Trophy size={16} />} label="Pass mark" value={`${q.passPercent}%`} />
//             <StatPill icon={<ShieldCheck size={16} />} label="Attempts" value={q.attemptsAllowed} />
//             <StatPill icon={<Clock size={16} />} label="Total points" value={q.totalPoints} />
//           </div>
//         </div>
//       </div>

//       {/* Details card */}
//       <div className="rounded-2xl border bg-white p-5 shadow-sm">
//         <h2 className="mb-3 text-sm font-semibold text-gray-700">About this quiz</h2>
//         <div className="grid gap-3 sm:grid-cols-2">
//           <KV label="Visibility" value={q.visibility === 'public' ? 'Public' : 'Login required'} />
//           <KV label="Time limit" value={q.timeLimitSec ? `${q.timeLimitSec} seconds` : 'No limit'} />
//           <KV label="Attempts allowed" value={String(q.attemptsAllowed)} />
//           <KV label="Price" value={priceLabel} />
//         </div>

//         <div className="mt-5 flex flex-wrap items-center gap-3">
//           <button
//             onClick={startOrCheckout}
//             disabled={busy}
//             className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:shadow disabled:opacity-60"
//           >
//             {busy
//               ? (showBuy ? 'Redirecting…' : 'Starting…')
//               : canStart
//                 ? 'Start quiz'
//                 : ent.includedInMembership
//                   ? 'Start (membership)'
//                   : `Buy • ${priceLabel}`}
//           </button>

//           <Link className="text-sm underline" to="/quizzes/attempts">
//   View past attempts
// </Link>
//           <Link className="text-sm text-gray-700 underline" to="/quizzes">
//             ← Back to all quizzes
//           </Link>
//         </div>
//       </div>
//     </div>
//   )
// }

// /* ---------- small UI helpers (no logic change) ---------- */

// function StatPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
//   return (
//     <div className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm shadow-sm">
//       <span className="grid h-7 w-7 place-items-center rounded-md border bg-gray-50">{icon}</span>
//       <div className="min-w-0">
//         <div className="text-xs text-gray-500">{label}</div>
//         <div className="truncate font-medium">{value}</div>
//       </div>
//     </div>
//   )
// }

// function KV({ label, value }: { label: string; value: string }) {
//   return (
//     <div className="rounded-lg border bg-gray-50 px-3 py-2 text-sm">
//       <div className="text-xs text-gray-500">{label}</div>
//       <div className="font-medium text-gray-800">{value}</div>
//     </div>
//   )
// }

import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getQuizBySlug, startAttempt, createQuizCheckout } from '@/lib/publicQuizzes.api'
import { useAuth } from '@/context/AuthProvider'
import {
  Trophy,
  Clock,
  ListChecks,
  ShieldCheck,
  Lock,
  Sparkles,
  Info,
  ArrowLeft,
  History,
} from 'lucide-react'

export default function PublicQuizViewPage() {
  const { slug = '' } = useParams()
  const nav = useNavigate()
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)
  const [data, setData] = useState<Awaited<ReturnType<typeof getQuizBySlug>> | null>(null)
  const [busy, setBusy] = useState(false)

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
        nav('/billing/plans', { state: { redirectTo: `/quizzes/${slug}` } })
        return
      }
      if (showBuy) {
        try {
          const { checkoutUrl } = await createQuizCheckout(slug)
          window.location.href = checkoutUrl
          return
        } catch (e: any) {
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

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl p-6 space-y-4">
        <div className="h-36 animate-pulse rounded-2xl bg-gray-100" />
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="h-24 animate-pulse rounded-xl bg-gray-100" />
          <div className="h-24 animate-pulse rounded-xl bg-gray-100" />
        </div>
      </div>
    )
  }
  if (err) {
    return (
      <div className="mx-auto max-w-3xl p-6 rounded-md border border-red-200 bg-red-50 p-4 text-red-700 flex items-center gap-2">
        <Info className="h-5 w-5 shrink-0" />
        {err}
      </div>
    )
  }
  if (!q) return null

  const visibilityPill =
    q.visibility === 'public'
      ? <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">Public</span>
      : <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700"><Lock size={14}/> Login required</span>

  const pricePill = (
    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
      {priceLabel}
    </span>
  )

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-6">
      {/* Hero */}
      <div className="overflow-hidden rounded-2xl border bg-gradient-to-br from-white to-gray-50 shadow-sm">
        <div className="relative p-5">
          <div className="absolute right-4 top-4 hidden rotate-6 sm:block">
            <Sparkles className="opacity-20" size={48} />
          </div>

          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                {visibilityPill}
                {pricePill}
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                  {q.timeLimitSec ? `${q.timeLimitSec}s limit` : 'No time limit'}
                </span>
              </div>
              <h1 className="truncate text-2xl font-semibold">{q.title}</h1>
              {q.description && (
                <p className="mt-1 text-gray-700">
                  {q.description}
                </p>
              )}
            </div>

            <button
              onClick={startOrCheckout}
              disabled={busy}
              className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:shadow disabled:opacity-60"
            >
              {busy
                ? (showBuy ? 'Redirecting…' : 'Starting…')
                : canStart
                  ? 'Start quiz'
                  : ent.includedInMembership
                    ? 'Start (membership)'
                    : `Buy • ${priceLabel}`}
            </button>
          </div>

          {/* Stat strip */}
          <div className="mt-4 grid gap-2 sm:grid-cols-4">
            <StatPill icon={<ListChecks size={16} />} label="Questions" value={q.questionCount} />
            <StatPill icon={<Trophy size={16} />} label="Pass mark" value={`${q.passPercent}%`} />
            <StatPill icon={<ShieldCheck size={16} />} label="Attempts" value={q.attemptsAllowed} />
            <StatPill icon={<Clock size={16} />} label="Total points" value={q.totalPoints} />
          </div>
        </div>
      </div>

      {/* Details card */}
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Info className="h-4 w-4" /> About this quiz
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <KV label="Visibility" value={q.visibility === 'public' ? 'Public' : 'Login required'} />
          <KV label="Time limit" value={q.timeLimitSec ? `${q.timeLimitSec} seconds` : 'No limit'} />
          <KV label="Attempts allowed" value={String(q.attemptsAllowed)} />
          <KV label="Price" value={priceLabel} />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            onClick={startOrCheckout}
            disabled={busy}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:shadow disabled:opacity-60"
          >
            {busy
              ? (showBuy ? 'Redirecting…' : 'Starting…')
              : canStart
                ? 'Start quiz'
                : ent.includedInMembership
                  ? 'Start (membership)'
                  : `Buy • ${priceLabel}`}
          </button>

          <Link className="text-sm inline-flex items-center gap-1.5 underline" to="/quizzes/attempts">
            <History className="h-4 w-4" />
            View past attempts
          </Link>
          <Link className="text-sm text-gray-700 inline-flex items-center gap-1.5 underline" to="/quizzes">
            <ArrowLeft className="h-4 w-4" />
            Back to all quizzes
          </Link>
        </div>
      </div>
    </div>
  )
}

/* ---------- small UI helpers (no logic change) ---------- */

function StatPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm shadow-sm">
      <span className="grid h-7 w-7 place-items-center rounded-md border bg-gray-50">{icon}</span>
      <div className="min-w-0">
        <div className="text-xs text-gray-500">{label}</div>
        <div className="truncate font-medium">{value}</div>
      </div>
    </div>
  )
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-gray-50 px-3 py-2 text-sm">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="font-medium text-gray-800">{value}</div>
    </div>
  )
}
