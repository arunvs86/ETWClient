// // import { useEffect, useState } from 'react'
// // import { useLocation, useParams } from 'react-router-dom'
// // import { getAttempt } from '@/lib/publicQuizzes.api'
// // import type { PlayQuestion, QuizPublic } from '@/lib/publicQuizzes.api'

// // type ResultState = {
// //   attempt: {
// //     id: string; status: 'submitted'; startedAt: string; completedAt: string;
// //     timeTakenSec: number; score: number; maxScore: number; percent: number; passed: boolean;
// //   },
// //   quiz: QuizPublic,
// //   results: {
// //     perQuestion: Array<PlayQuestion & {
// //       explanation?: string
// //       correctOptionIds?: string[]
// //       correctBoolean?: boolean
// //       correctText?: string[]
// //       grade: { earned: number; max: number; correct: boolean }
// //     }>
// //   }
// // }

// // export default function QuizResultPage() {
// //   const { attemptId = '' } = useParams()
// //   const loc = useLocation()
// //   const maybe = (loc.state as any)?.data as ResultState | undefined

// //   const [loading, setLoading] = useState(!maybe)
// //   const [err, setErr] = useState<string | null>(null)
// //   const [data, setData] = useState<ResultState | null>(maybe || null)

// //   useEffect(() => {
// //     if (maybe) return
// //     (async () => {
// //       try {
// //         setLoading(true)
// //         const resp = await getAttempt(attemptId)
// //         if (resp.attempt?.status !== 'submitted') {
// //           setErr('Attempt is not submitted yet.')
// //           return
// //         }
// //         setData(resp as ResultState)
// //       } catch (e: any) {
// //         setErr(e?.response?.data?.message || 'Failed to load attempt')
// //       } finally {
// //         setLoading(false)
// //       }
// //     })()
// //   }, [attemptId, maybe])

// //   if (loading) return <div className="mx-auto max-w-3xl p-6"><div className="h-32 animate-pulse rounded-lg bg-gray-100" /></div>
// //   if (err) return <div className="mx-auto max-w-3xl p-6 rounded-md border border-red-200 bg-red-50 p-4 text-red-700">{err}</div>
// //   if (!data) return null

// //   const { attempt, quiz, results } = data

// //   return (
// //     <div className="mx-auto max-w-3xl p-6 space-y-4">
// //       <div className="rounded-xl border bg-white p-4 shadow-sm">
// //         <div className="flex items-center justify-between">
// //           <div>
// //             <h1 className="text-xl font-semibold">{quiz.title}</h1>
// //             <div className="text-xs text-gray-600">Score: {attempt.score}/{attempt.maxScore} • {attempt.percent}% • {attempt.passed ? 'Passed' : 'Not passed'}</div>
// //             <div className="text-xs text-gray-600">Time: {attempt.timeTakenSec}s</div>
// //           </div>
// //           <a className="rounded-md border px-3 py-1.5 text-sm" href={`/quizzes/${quiz.slug}`}>Back to quiz</a>
// //         </div>
// //       </div>

// //       <div className="space-y-4">
// //         {results.perQuestion.map((q, idx) => (
// //           <div key={q.id} className="rounded-xl border bg-white p-4">
// //             <div className="mb-1 text-xs text-gray-500">
// //               {idx + 1}. {q.points} pt{q.points !== 1 ? 's' : ''} •
// //               <span className={`ml-1 ${q.grade.correct ? 'text-emerald-700' : 'text-red-700'}`}>
// //                 {q.grade.correct ? `Correct (+${q.grade.earned})` : `Incorrect (+${q.grade.earned})`}
// //               </span>
// //             </div>
// //             <div className="font-medium">{q.prompt}</div>

// //             <div className="mt-2 text-sm">
// //               {q.type === 'mcq' || q.type === 'multi' ? (
// //                 <>
// //                   <div className="text-gray-700">Correct option(s): {(q.correctOptionIds || []).join(', ') || '—'}</div>
// //                   {q.options?.length ? (
// //                     <ul className="mt-1 list-disc pl-5 text-gray-700">
// //                       {q.options.map(o => <li key={o.id}><span className="font-medium">{o.id}</span> — {o.text}</li>)}
// //                     </ul>
// //                   ) : null}
// //                 </>
// //               ) : q.type === 'boolean' ? (
// //                 <div className="text-gray-700">Correct answer: <span className="font-medium">{String(q.correctBoolean)}</span></div>
// //               ) : (
// //                 <div className="text-gray-700">Accepted answers: <span className="font-medium">{(q.correctText || []).join(', ') || '—'}</span></div>
// //               )}
// //             </div>

// //             {q.explanation && (
// //               <div className="mt-3 rounded-md bg-gray-50 p-3 text-sm text-gray-700">
// //                 <div className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">Explanation</div>
// //                 {q.explanation}
// //               </div>
// //             )}
// //           </div>
// //         ))}
// //       </div>
// //     </div>
// //   )
// // }


// import { useEffect, useState } from 'react'
// import { useLocation, useParams } from 'react-router-dom'
// import { getAttempt } from '@/lib/publicQuizzes.api'
// import type { PlayQuestion, QuizPublic } from '@/lib/publicQuizzes.api'

// type AttemptAnswer = {
//   questionId: string
//   selectedOptionIds?: string[]
//   booleanAnswer?: boolean
//   textAnswer?: string
// }

// type ResultState = {
//   attempt: {
//     id: string
//     status: 'submitted'
//     startedAt: string
//     completedAt: string
//     timeTakenSec: number
//     score: number
//     maxScore: number
//     percent: number
//     passed: boolean
//     // 👇 may be missing on first navigation after submit; present after getAttempt()
//     answers?: AttemptAnswer[]
//   }
//   quiz: QuizPublic
//   results: {
//     perQuestion: Array<
//       PlayQuestion & {
//         explanation?: string
//         correctOptionIds?: string[]
//         correctBoolean?: boolean
//         correctText?: string[]
//         grade: { earned: number; max: number; correct: boolean }
//       }
//     >
//   }
// }

// // Normalize any possible ObjectId-ish to plain string
// const normId = (v: any) => (v == null ? '' : typeof v === 'string' ? v : String(v))

// export default function QuizResultPage() {
//   const { attemptId = '' } = useParams()
//   const loc = useLocation()
//   const maybe = (loc.state as any)?.data as ResultState | undefined

//   const [data, setData] = useState<ResultState | null>(maybe || null)
//   // If we have state but it lacks answers, we should fetch once to hydrate
//   const shouldFetch = !maybe || !maybe.attempt?.answers || maybe.attempt.answers.length === 0

//   const [loading, setLoading] = useState<boolean>(!maybe || shouldFetch)
//   const [err, setErr] = useState<string | null>(null)

//   useEffect(() => {
//     let mounted = true
//     ;(async () => {
//       if (!shouldFetch) { setLoading(false); return }
//       try {
//         setLoading(true)
//         const resp = await getAttempt(attemptId)
//         if (resp.attempt?.status !== 'submitted') {
//           if (!mounted) return
//           setErr('Attempt is not submitted yet.')
//           return
//         }
//         if (!mounted) return
//         setData(resp as ResultState)
//         setErr(null)
//       } catch (e: any) {
//         if (!mounted) return
//         setErr(e?.response?.data?.message || 'Failed to load attempt')
//       } finally {
//         if (mounted) setLoading(false)
//       }
//     })()
//     return () => { mounted = false }
//   }, [attemptId, shouldFetch])

//   if (loading)
//     return (
//       <div className="mx-auto max-w-3xl p-6">
//         <div className="h-32 animate-pulse rounded-lg bg-gray-100" />
//       </div>
//     )
//   if (err)
//     return (
//       <div className="mx-auto max-w-3xl p-6 rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
//         {err}
//       </div>
//     )
//   if (!data) return null

//   const { attempt, quiz, results } = data

//   // Build a lookup from questionId -> user's answer (robust to ObjectId vs string)
//   const answersByQid: Record<string, AttemptAnswer> = {}
//   for (const a of attempt.answers || []) {
//     const qid = normId(a?.questionId)
//     if (qid) answersByQid[qid] = a
//   }

//   const chip = (label: string, tone: 'green' | 'red' | 'neutral' = 'neutral') => {
//     const base = 'inline-flex items-center rounded px-2 py-0.5 text-xs font-medium mr-1 mb-1'
//     if (tone === 'green') return <span className={`${base} bg-emerald-100 text-emerald-800`}>{label}</span>
//     if (tone === 'red') return <span className={`${base} bg-red-100 text-red-800`}>{label}</span>
//     return <span className={`${base} bg-gray-100 text-gray-800`}>{label}</span>
//   }
//   const optionLabel = (id: string, text?: string) => (text && text.trim().length ? `${id} — ${text}` : id)

//   return (
//     <div className="mx-auto max-w-3xl p-6 space-y-4">
//       <div className="rounded-xl border bg-white p-4 shadow-sm">
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-xl font-semibold">{quiz.title}</h1>
//             <div className="text-xs text-gray-600">
//               Score: {attempt.score}/{attempt.maxScore} • {attempt.percent}% • {attempt.passed ? 'Passed' : 'Not passed'}
//             </div>
//             <div className="text-xs text-gray-600">Time: {attempt.timeTakenSec}s</div>
//           </div>
//           <a className="rounded-md border px-3 py-1.5 text-sm" href={`/quizzes/${quiz.slug}`}>Back to quiz</a>
//         </div>
//       </div>

//       <div className="space-y-4">
//         {results.perQuestion.map((q, idx) => {
//           const qid = normId(q.id)
//           const ans = answersByQid[qid] || {}
//           const selected = new Set((ans.selectedOptionIds || []).map(normId))
//           const correct = new Set((q.correctOptionIds || []).map(normId))
//           const optionMap: Record<string, string> = {}
//           if (q.options?.length) for (const o of q.options) optionMap[normId(o.id)] = o.text || ''

//           return (
//             <div key={qid} className="rounded-xl border bg-white p-4">
//               <div className="mb-1 text-xs text-gray-500">
//                 {idx + 1}. {q.points} pt{q.points !== 1 ? 's' : ''} •
//                 <span className={`ml-1 ${q.grade.correct ? 'text-emerald-700' : 'text-red-700'}`}>
//                   {q.grade.correct ? `Correct (+${q.grade.earned})` : `Incorrect (+${q.grade.earned})`}
//                 </span>
//               </div>

//               <div className="font-medium">{q.prompt}</div>

//               {/* ---------- DETAILS ---------- */}
//               <div className="mt-3 text-sm text-gray-800 space-y-2">
//                 {(q.type === 'mcq' || q.type === 'multi') && (
//                   <>
//                     {/* Your answers */}
//                     <div>
//                       <div className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
//                         Your answer{selected.size > 1 ? 's' : ''}
//                       </div>
//                       {selected.size === 0 ? (
//                         <div className="text-gray-600">(no answer)</div>
//                       ) : (
//                         Array.from(selected).map(id => {
//                           const correctPick = correct.has(id)
//                           return chip(optionLabel(id, optionMap[id]), correctPick ? 'green' : 'red')
//                         })
//                       )}
//                     </div>

//                     {/* Correct answers */}
//                     <div>
//                       <div className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
//                         Correct answer{correct.size > 1 ? 's' : ''}
//                       </div>
//                       {correct.size === 0 ? (
//                         <div className="text-gray-600">—</div>
//                       ) : (
//                         Array.from(correct).map(id => chip(optionLabel(id, optionMap[id]), 'green'))
//                       )}
//                     </div>

//                     {/* Full option list — ALWAYS visible */}
//                     {q.options?.length ? (
//                       <ul className="mt-2 space-y-1">
//                         {q.options.map(o => {
//                           const id = normId(o.id)
//                           const isSel = selected.has(id)
//                           const isCor = correct.has(id)
//                           const rowBase = 'rounded-md border px-2 py-1 flex items-start gap-2'
//                           const row =
//                             isSel && isCor ? `${rowBase} border-emerald-200 bg-emerald-50` :
//                             isSel && !isCor ? `${rowBase} border-red-200 bg-red-50` :
//                             !isSel && isCor ? `${rowBase} border-emerald-200 ` :
//                             `${rowBase} border-gray-200`
//                           return (
//                             <li key={id} className={row}>
//                               <span
//                                 className={`mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded border text-xs ${
//                                   isCor ? 'border-emerald-300 text-emerald-700 ' : 'border-gray-300 text-gray-500 '
//                                 }`}
//                               >
//                                 {id}
//                               </span>
//                               <div className="flex-1 leading-5">{o.text}</div>
//                             </li>
//                           )
//                         })}
//                       </ul>
//                     ) : null}
//                   </>
//                 )}

//                 {q.type === 'boolean' && (
//                   <>
//                     <div>
//                       <div className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">Your answer</div>
//                       <div className={ans.booleanAnswer === q.correctBoolean ? 'text-emerald-700' : 'text-red-700'}>
//                         <span className="font-medium">{String(ans.booleanAnswer)}</span>
//                       </div>
//                     </div>
//                     <div>
//                       <div className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">Correct answer</div>
//                       <div className="text-emerald-700">
//                         <span className="font-medium">{String(q.correctBoolean)}</span>
//                       </div>
//                     </div>
//                   </>
//                 )}

//                 {q.type === 'short' && (
//                   <>
//                     <div>
//                       <div className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">Your answer</div>
//                       <div className={q.grade.correct ? 'text-emerald-700' : 'text-red-700'}>
//                         <span className="font-medium">{ans.textAnswer || '(no answer)'}</span>
//                       </div>
//                     </div>
//                     <div>
//                       <div className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">Accepted answers</div>
//                       <div className="text-emerald-700">
//                         <span className="font-medium">{(q.correctText || []).join(', ') || '—'}</span>
//                       </div>
//                     </div>
//                   </>
//                 )}
//               </div>

//               {q.explanation && (
//                 <div className="mt-3 rounded-md bg-gray-50 p-3 text-sm text-gray-700">
//                   <div className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">Explanation</div>
//                   {q.explanation}
//                 </div>
//               )}
//             </div>
//           )
//         })}
//       </div>
//     </div>
//   )
// }


// src/pages/quizzes/QuizResultPage.tsx
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { getAttempt } from '@/lib/publicQuizzes.api'
import type { PlayQuestion, QuizPublic } from '@/lib/publicQuizzes.api'

type AttemptAnswer = {
  questionId: string
  selectedOptionIds?: string[]
  booleanAnswer?: boolean
  textAnswer?: string
}

type ResultState = {
  attempt: {
    id: string
    status: 'submitted'
    startedAt: string
    completedAt: string
    timeTakenSec: number
    score: number
    maxScore: number
    percent: number
    passed: boolean
    // may be missing on first navigation after submit; present after getAttempt()
    answers?: AttemptAnswer[]
  }
  quiz: QuizPublic
  results: {
    perQuestion: Array<
      PlayQuestion & {
        explanation?: string
        correctOptionIds?: string[]
        correctBoolean?: boolean
        correctText?: string[]
        grade: { earned: number; max: number; correct: boolean }
      }
    >
  }
}

// Normalize any possible ObjectId-ish to plain string
const normId = (v: any) => (v == null ? '' : typeof v === 'string' ? v : String(v))

export default function QuizResultPage() {
  const { attemptId = '' } = useParams()
  const loc = useLocation()
  const maybe = (loc.state as any)?.data as ResultState | undefined

  const [data, setData] = useState<ResultState | null>(maybe || null)
  // If we have state but it lacks answers, fetch once to hydrate
  const shouldFetch = !maybe || !maybe.attempt?.answers || maybe.attempt.answers.length === 0

  const [loading, setLoading] = useState<boolean>(!maybe || shouldFetch)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      if (!shouldFetch) { setLoading(false); return }
      try {
        setLoading(true)
        const resp = await getAttempt(attemptId)
        if (resp.attempt?.status !== 'submitted') {
          if (!mounted) return
          setErr('Attempt is not submitted yet.')
          return
        }
        if (!mounted) return
        setData(resp as ResultState)
        setErr(null)
      } catch (e: any) {
        if (!mounted) return
        setErr(e?.response?.data?.message || 'Failed to load attempt')
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [attemptId, shouldFetch])

  // Always land at the top when results are ready
  useEffect(() => {
    if (!loading && !err) window.scrollTo({ top: 0, behavior: 'auto' })
  }, [loading, err])

  // ✅ Call this on EVERY render (handles nulls safely) to keep hook order stable
  const answersByQid: Record<string, AttemptAnswer> = useMemo(() => {
    const map: Record<string, AttemptAnswer> = {}
    const list = data?.attempt?.answers ?? []
    for (const a of list) {
      const qid = normId(a?.questionId)
      if (qid) map[qid] = a
    }
    return map
  }, [data?.attempt?.answers])

  if (loading)
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="h-32 animate-pulse rounded-lg bg-gray-100" />
      </div>
    )
  if (err)
    return (
      <div className="mx-auto max-w-3xl p-6 rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
        {err}
      </div>
    )
  if (!data) return null

  const { attempt, quiz, results } = data

  const chip = (label: string, tone: 'green' | 'red' | 'neutral' = 'neutral') => {
    const base = 'inline-flex items-center rounded px-2 py-0.5 text-xs font-medium mr-1 mb-1'
    if (tone === 'green') return <span className={`${base} bg-emerald-100 text-emerald-800`}>{label}</span>
    if (tone === 'red') return <span className={`${base} bg-red-100 text-red-800`}>{label}</span>
    return <span className={`${base} bg-gray-100 text-gray-800`}>{label}</span>
  }
  const optionLabel = (id: string, text?: string) => (text && text.trim().length ? `${id} — ${text}` : id)

  const passTone = attempt.passed ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-amber-700 bg-amber-50 border-amber-200'
  const barPct = Math.min(100, Math.max(0, attempt.percent))

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-4">
      {/* Score Header */}
      <div className={`rounded-2xl border ${passTone} p-5 shadow-sm`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold">{quiz.title}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
              {chip(`${attempt.score}/${attempt.maxScore} pts`, 'neutral')}
              {chip(`${attempt.percent}%`, attempt.passed ? 'green' : 'red')}
              {chip(attempt.passed ? 'Passed' : 'Not passed', attempt.passed ? 'green' : 'red')}
              {chip(`${results.perQuestion.length} questions`, 'neutral')}
              {chip(`Time: ${attempt.timeTakenSec}s`, 'neutral')}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a className="rounded-md border px-3 py-1.5 text-sm" href={`/quizzes/${quiz.slug}`}>Back to quiz</a>
            <a className="rounded-md border px-3 py-1.5 text-sm" to={`/quizzes/attempts/${attempt.id}`}>
  Past attempts
</a>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-2 w-full rounded-full bg-white/60">
          <div
            className={`h-2 rounded-full ${attempt.passed ? 'bg-emerald-500' : 'bg-amber-500'}`}
            style={{ width: `${barPct}%` }}
            aria-label="Score progress"
          />
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {results.perQuestion.map((q, idx) => {
          const qid = normId(q.id)
          const ans = answersByQid[qid] || {}
          const selected = new Set((ans.selectedOptionIds || []).map(normId))
          const correct = new Set((q.correctOptionIds || []).map(normId))
          const optionMap: Record<string, string> = {}
          if (q.options?.length) for (const o of q.options) optionMap[normId(o.id)] = o.text || ''

          return (
            <details key={qid} open className="group rounded-xl border bg-white p-4 shadow-sm">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-3">
                <div>
                  <div className="mb-1 text-xs text-gray-500">
                    {idx + 1}. {q.points} pt{q.points !== 1 ? 's' : ''} •
                    <span className={`ml-1 ${q.grade.correct ? 'text-emerald-700' : 'text-red-700'}`}>
                      {q.grade.correct ? `Correct (+${q.grade.earned})` : `Incorrect (+${q.grade.earned})`}
                    </span>
                  </div>
                  <div className="font-medium">{q.prompt}</div>
                </div>
                <span className="mt-1 rounded-md border px-2 py-0.5 text-xs text-gray-600 group-open:hidden">Collapse ▾</span>
                <span className="mt-1 hidden rounded-md border px-2 py-0.5 text-xs text-gray-600 group-open:inline">Expand ▸</span>
              </summary>

              <div className="mt-3 text-sm text-gray-800 space-y-3">
                {(q.type === 'mcq' || q.type === 'multi') && (
                  <>
                    {/* Your answers */}
                    <div>
                      <div className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                        Your answer{selected.size > 1 ? 's' : ''}
                      </div>
                      {selected.size === 0 ? (
                        <div className="text-gray-600">(no answer)</div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {Array.from(selected).map(id => {
                            const correctPick = correct.has(id)
                            return chip(optionLabel(id, optionMap[id]), correctPick ? 'green' : 'red')
                          })}
                        </div>
                      )}
                    </div>

                    {/* Correct answers */}
                    <div>
                      <div className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                        Correct answer{correct.size > 1 ? 's' : ''}
                      </div>
                      {correct.size === 0 ? (
                        <div className="text-gray-600">—</div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {Array.from(correct).map(id => chip(optionLabel(id, optionMap[id]), 'green'))}
                        </div>
                      )}
                    </div>

                    {/* Full option list — ALWAYS visible with fills */}
                    {q.options?.length ? (
                      <ul className="mt-2 space-y-1">
                        {q.options.map(o => {
                          const id = normId(o.id)
                          const isSel = selected.has(id)
                          const isCor = correct.has(id)
                          const base = 'rounded-md border px-2 py-2 flex items-start gap-2'
                          const row =
                            isSel && isCor ? `${base} border-emerald-200 bg-emerald-50` :
                            isSel && !isCor ? `${base} border-red-200 bg-red-50` :
                            !isSel && isCor ? `${base} border-emerald-200 bg-emerald-50/40` :
                            `${base} border-gray-200`
                          return (
                            <li key={id} className={row}>
                              <span
                                className={`mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded border text-xs ${
                                  isCor ? 'border-emerald-300 text-emerald-700' : 'border-gray-300 text-gray-500'
                                }`}
                              >
                                {id}
                              </span>
                              <div className="flex-1 leading-5">
                                <div className="flex items-center gap-2">
                                  <span>{o.text}</span>
                                  {isSel && isCor && <span aria-hidden>✓</span>}
                                  {isSel && !isCor && <span aria-hidden>✗</span>}
                                </div>
                              </div>
                            </li>
                          )
                        })}
                      </ul>
                    ) : null}
                  </>
                )}

                {q.type === 'boolean' && (
                  <>
                    <div>
                      <div className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">Your answer</div>
                      <div className={ans.booleanAnswer === q.correctBoolean ? 'text-emerald-700' : 'text-red-700'}>
                        <span className="font-medium">{String(ans.booleanAnswer)}</span>
                      </div>
                    </div>
                    <div>
                      <div className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">Correct answer</div>
                      <div className="text-emerald-700">
                        <span className="font-medium">{String(q.correctBoolean)}</span>
                      </div>
                    </div>
                  </>
                )}

                {q.type === 'short' && (
                  <>
                    <div>
                      <div className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">Your answer</div>
                      <div className={q.grade.correct ? 'text-emerald-700' : 'text-red-700'}>
                        <span className="font-medium">{ans.textAnswer || '(no answer)'}</span>
                      </div>
                    </div>
                    <div>
                      <div className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">Accepted answers</div>
                      <div className="text-emerald-700">
                        <span className="font-medium">{(q.correctText || []).join(', ') || '—'}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {q.explanation && (
                <div className="mt-3 rounded-md bg-gray-50 p-3 text-sm text-gray-700">
                  <div className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">Explanation</div>
                  {q.explanation}
                </div>
              )}
            </details>
          )
        })}
      </div>

      {/* Back to top */}
      <div className="flex justify-end">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="rounded-md border px-3 py-1.5 text-sm"
        >
          Back to top ↑
        </button>
      </div>
    </div>
  )
}
