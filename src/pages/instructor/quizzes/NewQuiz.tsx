// import { useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import Button from '@/components/ui/Button'
// import { createQuiz } from '@/lib/instructorQuizzes.api'

// type AccessMode = 'free' | 'members' | 'paid'

// export default function NewQuiz() {
//   const nav = useNavigate()
//   const [title, setTitle] = useState('')
//   const [description, setDescription] = useState('')
//   const [attemptsAllowed, setAttemptsAllowed] = useState(1)
//   const [passPercent, setPassPercent] = useState(70)
//   const [timeLimitMin, setTimeLimitMin] = useState(0) // minutes
//   const [visibility, setVisibility] = useState<'public'|'enrolled'>('public')

//   // ✅ Pricing UI state
//   const [accessMode, setAccessMode] = useState<AccessMode>('free') // 'free' | 'members' | 'paid'
//   const [priceGBP, setPriceGBP] = useState<string>('9.99')         // text input, parse to number
//   const [currency, setCurrency] = useState<'GBP'|'USD'|'EUR'>('GBP')

//   const [busy, setBusy] = useState(false)
//   const [err, setErr] = useState<string|null>(null)

//   function priceMinor(): number {
//     const n = Number(priceGBP)
//     if (!Number.isFinite(n) || n < 0) return 0
//     return Math.round(n * 100)
//   }

//   async function handleCreate() {
//     if (!title.trim()) { setErr('Title is required'); return }

//     // ✅ simple validation for paid/members modes
//     if ((accessMode === 'paid' || accessMode === 'members') && priceMinor() <= 0) {
//       setErr('Please enter a valid price greater than 0.')
//       return
//     }

//     setBusy(true); setErr(null)
//     try {
//       const quiz = await createQuiz({
//         title: title.trim(),
//         description: description.trim(),
//         attemptsAllowed: Math.max(1, attemptsAllowed),
//         passPercent: Math.max(0, Math.min(100, passPercent)),
//         timeLimitSec: Math.max(0, timeLimitMin * 60), // minutes → seconds
//         visibility,

//         // ✅ send pricing to backend
//         pricing: {
//           isFree: accessMode === 'free',
//           includedInMembership: accessMode === 'members',
//           amountMinor: accessMode === 'free' ? 0 : priceMinor(),
//           currency,
//         },
//       })
//       nav(`/instructor/quizzes/${quiz.id}/questions`, { replace: true })
//     } catch (e:any) {
//       setErr(e?.response?.data?.message || e?.message || 'Failed to create quiz')
//     } finally { setBusy(false) }
//   }

//   return (
//     <main className="container-app py-8">
//       <h1 className="mb-4 text-2xl font-semibold tracking-tight">New Quiz</h1>
//       {err && <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}

//       <section className="card max-w-3xl p-5">
//         <div className="grid gap-4 sm:grid-cols-2">
//           {/* Basics */}
//           <label className="block text-sm sm:col-span-2">
//             <div className="mb-1 font-medium text-gray-800">Title</div>
//             <input className="input" value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g., UCAT Mock A" />
//           </label>
//           <label className="block text-sm sm:col-span-2">
//             <div className="mb-1 font-medium text-gray-800">Description</div>
//             <textarea className="input min-h-[100px]" value={description} onChange={e=>setDescription(e.target.value)} placeholder="Brief description…" />
//           </label>

//           {/* Delivery rules */}
//           <label className="block text-sm">
//             <div className="mb-1 font-medium text-gray-800">Attempts allowed</div>
//             <input type="number" min={1} className="input" value={attemptsAllowed} onChange={e=>setAttemptsAllowed(Math.max(1, Number(e.target.value)||1))}/>
//           </label>
//           <label className="block text-sm">
//             <div className="mb-1 font-medium text-gray-800">Pass %</div>
//             <input type="number" min={0} max={100} className="input" value={passPercent} onChange={e=>setPassPercent(Math.max(0, Math.min(100, Number(e.target.value)||0)))}/>
//           </label>
//           <label className="block text-sm">
//             <div className="mb-1 font-medium text-gray-800">Time limit (minutes)</div>
//             <input type="number" min={0} className="input" value={timeLimitMin} onChange={e=>setTimeLimitMin(Math.max(0, Number(e.target.value)||0))}/>
//             <div className="mt-1 text-xs text-gray-500">0 = unlimited</div>
//           </label>
//           <label className="block text-sm">
//             <div className="mb-1 font-medium text-gray-800">Visibility</div>
//             <select className="input bg-white" value={visibility} onChange={e=>setVisibility(e.target.value as any)}>
//               <option value="public">public</option>
//               <option value="enrolled">enrolled</option>
//             </select>
//           </label>

//           {/* ✅ Access & Pricing */}
//           <div className="sm:col-span-2 rounded-lg border p-3">
//             <div className="mb-2 text-sm font-medium text-gray-800">Access & Pricing</div>

//             <div className="flex flex-wrap gap-2">
//               <label className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer ${accessMode==='free' ? 'border-black' : ''}`}>
//                 <input
//                   type="radio"
//                   name="accessMode"
//                   checked={accessMode==='free'}
//                   onChange={()=>setAccessMode('free')}
//                 />
//                 <span>Free</span>
//               </label>

//               <label className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer ${accessMode==='members' ? 'border-black' : ''}`}>
//                 <input
//                   type="radio"
//                   name="accessMode"
//                   checked={accessMode==='members'}
//                   onChange={()=>setAccessMode('members')}
//                 />
//                 <span>Free for members (paid for non-members)</span>
//               </label>

//               <label className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer ${accessMode==='paid' ? 'border-black' : ''}`}>
//                 <input
//                   type="radio"
//                   name="accessMode"
//                   checked={accessMode==='paid'}
//                   onChange={()=>setAccessMode('paid')}
//                 />
//                 <span>Paid</span>
//               </label>
//             </div>

//             {/* Price inputs (only for members/paid) */}
//             {(accessMode==='members' || accessMode==='paid') && (
//               <div className="mt-3 grid gap-3 sm:grid-cols-[1fr,120px]">
//                 <label className="block text-sm">
//                   <div className="mb-1 font-medium text-gray-800">Price</div>
//                   <div className="flex items-center gap-2">
//                     <input
//                       className="input flex-1"
//                       inputMode="decimal"
//                       placeholder="e.g. 9.99"
//                       value={priceGBP}
//                       onChange={(e)=>setPriceGBP(e.target.value)}
//                     />
//                     <select className="input w-28 bg-white" value={currency} onChange={e=>setCurrency(e.target.value as any)}>
//                       <option value="GBP">GBP</option>
//                       <option value="USD">USD</option>
//                       <option value="EUR">EUR</option>
//                     </select>
//                   </div>
//                   <div className="mt-1 text-xs text-gray-500">
//                     Members will get this quiz at no extra cost when “Free for members” is selected.
//                   </div>
//                 </label>
//               </div>
//             )}

//             {accessMode==='free' && (
//               <div className="mt-2 text-xs text-gray-600">This quiz will be free for everyone (no checkout).</div>
//             )}
//           </div>
//         </div>

//         <div className="mt-4 flex items-center justify-end">
//           <Button onClick={handleCreate} disabled={busy || !title.trim()}>
//             {busy ? 'Creating…' : 'Create quiz'}
//           </Button>
//         </div>
//       </section>
//     </main>
//   )
// }


import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/ui/Button'
import { createQuiz } from '@/lib/instructorQuizzes.api'
import { AlertCircle, Hash, Percent, Timer, Eye, Users, PoundSterling } from 'lucide-react'

type AccessMode = 'free' | 'members' | 'paid'

export default function NewQuiz() {
  const nav = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [attemptsAllowed, setAttemptsAllowed] = useState(1)
  const [passPercent, setPassPercent] = useState(70)
  const [timeLimitMin, setTimeLimitMin] = useState(0) // minutes
  const [visibility, setVisibility] = useState<'public'|'enrolled'>('public')

  // ✅ Pricing UI state
  const [accessMode, setAccessMode] = useState<AccessMode>('free') // 'free' | 'members' | 'paid'
  const [priceGBP, setPriceGBP] = useState<string>('9.99')         // text input, parse to number
  const [currency, setCurrency] = useState<'GBP'|'USD'|'EUR'>('GBP')

  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string|null>(null)

  function priceMinor(): number {
    const n = Number(priceGBP)
    if (!Number.isFinite(n) || n < 0) return 0
    return Math.round(n * 100)
  }

  async function handleCreate() {
    if (!title.trim()) { setErr('Title is required'); return }

    // ✅ simple validation for paid/members modes
    if ((accessMode === 'paid' || accessMode === 'members') && priceMinor() <= 0) {
      setErr('Please enter a valid price greater than 0.')
      return
    }

    setBusy(true); setErr(null)
    try {
      const quiz = await createQuiz({
        title: title.trim(),
        description: description.trim(),
        attemptsAllowed: Math.max(1, attemptsAllowed),
        passPercent: Math.max(0, Math.min(100, passPercent)),
        timeLimitSec: Math.max(0, timeLimitMin * 60), // minutes → seconds
        visibility,
        // ✅ send pricing to backend
        pricing: {
          isFree: accessMode === 'free',
          includedInMembership: accessMode === 'members',
          amountMinor: accessMode === 'free' ? 0 : priceMinor(),
          currency,
        },
      })
      nav(`/instructor/quizzes/${quiz.id}/questions`, { replace: true })
    } catch (e:any) {
      setErr(e?.response?.data?.message || e?.message || 'Failed to create quiz')
    } finally { setBusy(false) }
  }

  return (
    <main className="container-app py-8">
      {/* Header */}
      <div className="mb-4 rounded-2xl border bg-gradient-to-br from-white to-gray-50 p-5 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight">Create a new quiz</h1>
        <p className="mt-1 text-sm text-gray-600">Set rules, access, and pricing — you can add questions next.</p>
      </div>

      {err && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>{err}</div>
        </div>
      )}

      <section className="relative mx-auto max-w-3xl rounded-2xl border bg-white p-5 shadow-sm">
        <div className="grid gap-5">
          {/* Basics */}
          <div className="grid gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-800">Title</label>
              <div className="relative">
                <Hash className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  className="input w-full rounded-xl border-gray-300 pl-9 focus:ring-4 focus:ring-primary/20"
                  value={title}
                  onChange={e=>setTitle(e.target.value)}
                  placeholder="e.g., UCAT Mock A"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-800">Description</label>
              <div className="relative">
                <textarea
                  className="input min-h-[110px] w-full rounded-xl border-gray-300 pr-3 focus:ring-4 focus:ring-primary/20"
                  value={description}
                  onChange={e=>setDescription(e.target.value)}
                  placeholder="Brief description…"
                />
                <div className="pointer-events-none absolute bottom-2 right-3 text-xs text-gray-400">
                  Markdown supported
                </div>
              </div>
            </div>
          </div>

          {/* Delivery rules */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-800">Attempts allowed</label>
              <div className="relative">
                <Users className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  min={1}
                  className="input w-full rounded-xl border-gray-300 pl-9 focus:ring-4 focus:ring-primary/20"
                  value={attemptsAllowed}
                  onChange={e=>setAttemptsAllowed(Math.max(1, Number(e.target.value)||1))}
                />
              </div>
              <p className="text-xs text-gray-500">Minimum 1</p>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-800">Pass %</label>
              <div className="relative">
                <Percent className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  min={0}
                  max={100}
                  className="input w-full rounded-xl border-gray-300 pl-9 focus:ring-4 focus:ring-primary/20"
                  value={passPercent}
                  onChange={e=>setPassPercent(Math.max(0, Math.min(100, Number(e.target.value)||0)))}
                />
              </div>
              <p className="text-xs text-gray-500">Between 0 and 100</p>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-800">Time limit (minutes)</label>
              <div className="relative">
                <Timer className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  min={0}
                  className="input w-full rounded-xl border-gray-300 pl-9 focus:ring-4 focus:ring-primary/20"
                  value={timeLimitMin}
                  onChange={e=>setTimeLimitMin(Math.max(0, Number(e.target.value)||0))}
                />
              </div>
              <p className="text-xs text-gray-500">0 = unlimited</p>
            </div>
          </div>

          {/* Visibility */}
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-800">Visibility</label>
              <div className="relative">
                <Eye className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <select
                  className="input w-full rounded-xl border-gray-300 pl-9 bg-white focus:ring-4 focus:ring-primary/20"
                  value={visibility}
                  onChange={e=>setVisibility(e.target.value as any)}
                >
                  <option value="public">public</option>
                  <option value="enrolled">enrolled</option>
                </select>
              </div>
              <p className="text-xs text-gray-500">Public quizzes appear in the catalog.</p>
            </div>
          </div>

          {/* Access & Pricing */}
          <div className="rounded-2xl border p-4">
            <div className="mb-3 text-sm font-medium text-gray-800">Access & Pricing</div>

            {/* Chip radios */}
            <div className="flex flex-wrap gap-2">
              <label
                className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-2 text-sm transition ${
                  accessMode==='free'
                    ? 'border-primary/60 bg-primary/5 text-primary'
                    : 'hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="accessMode"
                  className="accent-primary"
                  checked={accessMode==='free'}
                  onChange={()=>setAccessMode('free')}
                />
                <span>Free</span>
              </label>

              <label
                className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-2 text-sm transition ${
                  accessMode==='members'
                    ? 'border-primary/60 bg-primary/5 text-primary'
                    : 'hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="accessMode"
                  className="accent-primary"
                  checked={accessMode==='members'}
                  onChange={()=>setAccessMode('members')}
                />
                <span>Free for members (paid for non-members)</span>
              </label>

              <label
                className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-2 text-sm transition ${
                  accessMode==='paid'
                    ? 'border-primary/60 bg-primary/5 text-primary'
                    : 'hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="accessMode"
                  className="accent-primary"
                  checked={accessMode==='paid'}
                  onChange={()=>setAccessMode('paid')}
                />
                <span>Paid</span>
              </label>
            </div>

            {/* Price inputs (only for members/paid) */}
            {(accessMode==='members' || accessMode==='paid') && (
              <div className="mt-4 grid gap-3 sm:grid-cols-[1fr,140px]">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-800">Price</label>
                  <div className="relative flex items-stretch">
                    <div className="pointer-events-none absolute left-3 top-2.5 text-gray-400">
                      <PoundSterling className="h-4 w-4" />
                    </div>
                    <input
                      className="input flex-1 rounded-l-xl border-gray-300 pl-9 focus:z-10 focus:ring-4 focus:ring-primary/20"
                      inputMode="decimal"
                      placeholder="e.g. 9.99"
                      value={priceGBP}
                      onChange={(e)=>setPriceGBP(e.target.value)}
                    />
                    <select
                      className="input w-28 rounded-r-xl border-l-0 bg-white focus:z-10 focus:ring-4 focus:ring-primary/20"
                      value={currency}
                      onChange={e=>setCurrency(e.target.value as any)}
                    >
                      <option value="GBP">GBP</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                  <p className="text-xs text-gray-500">
                    When “Free for members” is selected, members pay nothing; non-members pay this price.
                  </p>
                </div>
              </div>
            )}

            {accessMode==='free' && (
              <div className="mt-2 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">
                This quiz will be free for everyone (no checkout).
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end">
          <Button onClick={handleCreate} disabled={busy || !title.trim()}>
            {busy ? 'Creating…' : 'Create quiz'}
          </Button>
        </div>
      </section>
    </main>
  )
}
