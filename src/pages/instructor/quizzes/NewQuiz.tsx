// import { useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import Button from '@/components/ui/Button'
// import { createQuiz } from '@/lib/instructorQuizzes.api'

// export default function NewQuiz() {
//   const nav = useNavigate()
//   const [title, setTitle] = useState('')
//   const [description, setDescription] = useState('')
//   const [attemptsAllowed, setAttemptsAllowed] = useState(1)
//   const [passPercent, setPassPercent] = useState(70)
//   const [timeLimitMin, setTimeLimitMin] = useState(0) // minutes
//   const [visibility, setVisibility] = useState<'public'|'enrolled'>('public')
//   const [busy, setBusy] = useState(false)
//   const [err, setErr] = useState<string|null>(null)

//   async function handleCreate() {
//     if (!title.trim()) { setErr('Title is required'); return }
//     setBusy(true); setErr(null)
//     try {
//       const quiz = await createQuiz({
//         title: title.trim(),
//         description: description.trim(),
//         attemptsAllowed: Math.max(1, attemptsAllowed),
//         passPercent: Math.max(0, Math.min(100, passPercent)),
//         timeLimitSec: Math.max(0, timeLimitMin * 60), // minutes → seconds
//         visibility,
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
//           <label className="block text-sm sm:col-span-2">
//             <div className="mb-1 font-medium text-gray-800">Title</div>
//             <input className="input" value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g., UCAT Mock A" />
//           </label>
//           <label className="block text-sm sm:col-span-2">
//             <div className="mb-1 font-medium text-gray-800">Description</div>
//             <textarea className="input min-h-[100px]" value={description} onChange={e=>setDescription(e.target.value)} placeholder="Brief description…" />
//           </label>
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
//         </div>
//         <div className="mt-4 flex items-center justify-end">
//           <Button onClick={handleCreate} disabled={busy || !title.trim()}>{busy ? 'Creating…' : 'Create quiz'}</Button>
//         </div>
//       </section>
//     </main>
//   )
// }

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/ui/Button'
import { createQuiz } from '@/lib/instructorQuizzes.api'

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
      <h1 className="mb-4 text-2xl font-semibold tracking-tight">New Quiz</h1>
      {err && <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}

      <section className="card max-w-3xl p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Basics */}
          <label className="block text-sm sm:col-span-2">
            <div className="mb-1 font-medium text-gray-800">Title</div>
            <input className="input" value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g., UCAT Mock A" />
          </label>
          <label className="block text-sm sm:col-span-2">
            <div className="mb-1 font-medium text-gray-800">Description</div>
            <textarea className="input min-h-[100px]" value={description} onChange={e=>setDescription(e.target.value)} placeholder="Brief description…" />
          </label>

          {/* Delivery rules */}
          <label className="block text-sm">
            <div className="mb-1 font-medium text-gray-800">Attempts allowed</div>
            <input type="number" min={1} className="input" value={attemptsAllowed} onChange={e=>setAttemptsAllowed(Math.max(1, Number(e.target.value)||1))}/>
          </label>
          <label className="block text-sm">
            <div className="mb-1 font-medium text-gray-800">Pass %</div>
            <input type="number" min={0} max={100} className="input" value={passPercent} onChange={e=>setPassPercent(Math.max(0, Math.min(100, Number(e.target.value)||0)))}/>
          </label>
          <label className="block text-sm">
            <div className="mb-1 font-medium text-gray-800">Time limit (minutes)</div>
            <input type="number" min={0} className="input" value={timeLimitMin} onChange={e=>setTimeLimitMin(Math.max(0, Number(e.target.value)||0))}/>
            <div className="mt-1 text-xs text-gray-500">0 = unlimited</div>
          </label>
          <label className="block text-sm">
            <div className="mb-1 font-medium text-gray-800">Visibility</div>
            <select className="input bg-white" value={visibility} onChange={e=>setVisibility(e.target.value as any)}>
              <option value="public">public</option>
              <option value="enrolled">enrolled</option>
            </select>
          </label>

          {/* ✅ Access & Pricing */}
          <div className="sm:col-span-2 rounded-lg border p-3">
            <div className="mb-2 text-sm font-medium text-gray-800">Access & Pricing</div>

            <div className="flex flex-wrap gap-2">
              <label className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer ${accessMode==='free' ? 'border-black' : ''}`}>
                <input
                  type="radio"
                  name="accessMode"
                  checked={accessMode==='free'}
                  onChange={()=>setAccessMode('free')}
                />
                <span>Free</span>
              </label>

              <label className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer ${accessMode==='members' ? 'border-black' : ''}`}>
                <input
                  type="radio"
                  name="accessMode"
                  checked={accessMode==='members'}
                  onChange={()=>setAccessMode('members')}
                />
                <span>Free for members (paid for non-members)</span>
              </label>

              <label className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer ${accessMode==='paid' ? 'border-black' : ''}`}>
                <input
                  type="radio"
                  name="accessMode"
                  checked={accessMode==='paid'}
                  onChange={()=>setAccessMode('paid')}
                />
                <span>Paid</span>
              </label>
            </div>

            {/* Price inputs (only for members/paid) */}
            {(accessMode==='members' || accessMode==='paid') && (
              <div className="mt-3 grid gap-3 sm:grid-cols-[1fr,120px]">
                <label className="block text-sm">
                  <div className="mb-1 font-medium text-gray-800">Price</div>
                  <div className="flex items-center gap-2">
                    <input
                      className="input flex-1"
                      inputMode="decimal"
                      placeholder="e.g. 9.99"
                      value={priceGBP}
                      onChange={(e)=>setPriceGBP(e.target.value)}
                    />
                    <select className="input w-28 bg-white" value={currency} onChange={e=>setCurrency(e.target.value as any)}>
                      <option value="GBP">GBP</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    Members will get this quiz at no extra cost when “Free for members” is selected.
                  </div>
                </label>
              </div>
            )}

            {accessMode==='free' && (
              <div className="mt-2 text-xs text-gray-600">This quiz will be free for everyone (no checkout).</div>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end">
          <Button onClick={handleCreate} disabled={busy || !title.trim()}>
            {busy ? 'Creating…' : 'Create quiz'}
          </Button>
        </div>
      </section>
    </main>
  )
}
