// // src/pages/quizzes/QuizResultPage.tsx
// import { useEffect, useMemo, useState } from 'react'
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
//     // may be missing on first navigation after submit; present after getAttempt()
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
//   // If we have state but it lacks answers, fetch once to hydrate
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

//   // Always land at the top when results are ready
//   useEffect(() => {
//     if (!loading && !err) window.scrollTo({ top: 0, behavior: 'auto' })
//   }, [loading, err])

//   // ✅ Call this on EVERY render (handles nulls safely) to keep hook order stable
//   const answersByQid: Record<string, AttemptAnswer> = useMemo(() => {
//     const map: Record<string, AttemptAnswer> = {}
//     const list = data?.attempt?.answers ?? []
//     for (const a of list) {
//       const qid = normId(a?.questionId)
//       if (qid) map[qid] = a
//     }
//     return map
//   }, [data?.attempt?.answers])

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

//   const chip = (label: string, tone: 'green' | 'red' | 'neutral' = 'neutral') => {
//     const base = 'inline-flex items-center rounded px-2 py-0.5 text-xs font-medium mr-1 mb-1'
//     if (tone === 'green') return <span className={`${base} bg-emerald-100 text-emerald-800`}>{label}</span>
//     if (tone === 'red') return <span className={`${base} bg-red-100 text-red-800`}>{label}</span>
//     return <span className={`${base} bg-gray-100 text-gray-800`}>{label}</span>
//   }
//   const optionLabel = (id: string, text?: string) => (text && text.trim().length ? `${id} — ${text}` : id)

//   const passTone = attempt.passed ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-amber-700 bg-amber-50 border-amber-200'
//   const barPct = Math.min(100, Math.max(0, attempt.percent))

//   return (
//     <div className="mx-auto max-w-3xl p-6 space-y-4">
//       {/* Score Header */}
//       <div className={`rounded-2xl border ${passTone} p-5 shadow-sm`}>
//         <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//           <div>
//             <h1 className="text-xl font-semibold">{quiz.title}</h1>
//             <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
//               {chip(`${attempt.score}/${attempt.maxScore} pts`, 'neutral')}
//               {chip(`${attempt.percent}%`, attempt.passed ? 'green' : 'red')}
//               {chip(attempt.passed ? 'Passed' : 'Not passed', attempt.passed ? 'green' : 'red')}
//               {chip(`${results.perQuestion.length} questions`, 'neutral')}
//               {chip(`Time: ${attempt.timeTakenSec}s`, 'neutral')}
//             </div>
//           </div>
//           <div className="flex items-center gap-2">
//             <a className="rounded-md border px-3 py-1.5 text-sm" href={`/quizzes/${quiz.slug}`}>Back to quiz</a>
//             <a className="rounded-md border px-3 py-1.5 text-sm" to={`/quizzes/attempts/${attempt.id}`}>
//   Past attempts
// </a>
//           </div>
//         </div>

//         {/* Progress bar */}
//         <div className="mt-4 h-2 w-full rounded-full bg-white/60">
//           <div
//             className={`h-2 rounded-full ${attempt.passed ? 'bg-emerald-500' : 'bg-amber-500'}`}
//             style={{ width: `${barPct}%` }}
//             aria-label="Score progress"
//           />
//         </div>
//       </div>

//       {/* Questions */}
//       <div className="space-y-4">
//         {results.perQuestion.map((q, idx) => {
//           const qid = normId(q.id)
//           const ans = answersByQid[qid] || {}
//           const selected = new Set((ans.selectedOptionIds || []).map(normId))
//           const correct = new Set((q.correctOptionIds || []).map(normId))
//           const optionMap: Record<string, string> = {}
//           if (q.options?.length) for (const o of q.options) optionMap[normId(o.id)] = o.text || ''

//           return (
//             <details key={qid} open className="group rounded-xl border bg-white p-4 shadow-sm">
//               <summary className="flex cursor-pointer list-none items-start justify-between gap-3">
//                 <div>
//                   <div className="mb-1 text-xs text-gray-500">
//                     {idx + 1}. {q.points} pt{q.points !== 1 ? 's' : ''} •
//                     <span className={`ml-1 ${q.grade.correct ? 'text-emerald-700' : 'text-red-700'}`}>
//                       {q.grade.correct ? `Correct (+${q.grade.earned})` : `Incorrect (+${q.grade.earned})`}
//                     </span>
//                   </div>
//                   <div className="font-medium">{q.prompt}</div>
//                 </div>
//                 <span className="mt-1 rounded-md border px-2 py-0.5 text-xs text-gray-600 group-open:hidden">Collapse ▾</span>
//                 <span className="mt-1 hidden rounded-md border px-2 py-0.5 text-xs text-gray-600 group-open:inline">Expand ▸</span>
//               </summary>

//               <div className="mt-3 text-sm text-gray-800 space-y-3">
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
//                         <div className="flex flex-wrap gap-2">
//                           {Array.from(selected).map(id => {
//                             const correctPick = correct.has(id)
//                             return chip(optionLabel(id, optionMap[id]), correctPick ? 'green' : 'red')
//                           })}
//                         </div>
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
//                         <div className="flex flex-wrap gap-2">
//                           {Array.from(correct).map(id => chip(optionLabel(id, optionMap[id]), 'green'))}
//                         </div>
//                       )}
//                     </div>

//                     {/* Full option list — ALWAYS visible with fills */}
//                     {q.options?.length ? (
//                       <ul className="mt-2 space-y-1">
//                         {q.options.map(o => {
//                           const id = normId(o.id)
//                           const isSel = selected.has(id)
//                           const isCor = correct.has(id)
//                           const base = 'rounded-md border px-2 py-2 flex items-start gap-2'
//                           const row =
//                             isSel && isCor ? `${base} border-emerald-200 bg-emerald-50` :
//                             isSel && !isCor ? `${base} border-red-200 bg-red-50` :
//                             !isSel && isCor ? `${base} border-emerald-200 bg-emerald-50/40` :
//                             `${base} border-gray-200`
//                           return (
//                             <li key={id} className={row}>
//                               <span
//                                 className={`mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded border text-xs ${
//                                   isCor ? 'border-emerald-300 text-emerald-700' : 'border-gray-300 text-gray-500'
//                                 }`}
//                               >
//                                 {id}
//                               </span>
//                               <div className="flex-1 leading-5">
//                                 <div className="flex items-center gap-2">
//                                   <span>{o.text}</span>
//                                   {isSel && isCor && <span aria-hidden>✓</span>}
//                                   {isSel && !isCor && <span aria-hidden>✗</span>}
//                                 </div>
//                               </div>
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
//             </details>
//           )
//         })}
//       </div>

//       {/* Back to top */}
//       <div className="flex justify-end">
//         <button
//           onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
//           className="rounded-md border px-3 py-1.5 text-sm"
//         >
//           Back to top ↑
//         </button>
//       </div>
//     </div>
//   )
// }

// src/pages/quizzes/QuizResultPage.tsx
import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { getAttempt } from '@/lib/publicQuizzes.api'
import type { PlayQuestion, QuizPublic } from '@/lib/publicQuizzes.api'

type AttemptAnswer = {
  questionId: string
  selectedOptionIds?: string[]
  booleanAnswer?: boolean
  textAnswer?: string
}

type ResultQuestion = PlayQuestion & {
  media?: Array<{ kind: string; url: string; alt?: string }>;
  options?: Array<PlayQuestion['options'][number] & {
    media?: Array<{ kind: string; url: string; alt?: string }>;
  }>;
  explanation?: string;
  correctOptionIds?: string[];
  correctBoolean?: boolean;
  correctText?: string[];
  grade: { earned: number; max: number; correct: boolean };
};

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
    answers?: AttemptAnswer[]
  }
  quiz: QuizPublic
  results: { perQuestion: ResultQuestion[] };
}

const normId = (v: any) => (v == null ? '' : typeof v === 'string' ? v : String(v))

export default function QuizResultPage() {
  const { attemptId = '' } = useParams()
  const loc = useLocation()
  const maybe = (loc.state as any)?.data as ResultState | undefined

  const [data, setData] = useState<ResultState | null>(maybe || null)
  const shouldFetch = !maybe || !maybe.attempt?.answers || maybe.attempt.answers.length === 0

  const [loading, setLoading] = useState<boolean>(!maybe || shouldFetch)
  const [err, setErr] = useState<string | null>(null)

  function QuestionMedia({ media }: { media?: Array<{ kind: string; url: string; alt?: string }> }) {
    if (!media?.length) return null;
    const imgs = media.filter(m => m && m.kind === 'image' && m.url);
    if (!imgs.length) return null;
    return (
      <div className="my-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {imgs.map((m, i) => (
          <div key={i} className="overflow-hidden rounded-md border bg-gray-50">
            <img
              src={m.url}
              alt={m.alt || 'question image'}
              loading="lazy"
              className="h-48 w-full object-contain bg-white"
            />
          </div>
        ))}
      </div>
    );
  }
  
  function OptionMedia({ media }: { media?: Array<{ kind: string; url: string; alt?: string }> }) {
    if (!media?.length) return null;
    const imgs = media.filter(m => m && m.kind === 'image' && m.url);
    if (!imgs.length) return null;
    return (
      <div className="mt-2 grid grid-cols-1 gap-2">
        {imgs.map((m, i) => (
          <img
            key={i}
            src={m.url}
            alt={m.alt || 'option image'}
            loading="lazy"
            className="max-h-40 w-full rounded-md border bg-white object-contain"
          />
        ))}
      </div>
    );
  }

  
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

  useEffect(() => {
    if (!loading && !err) window.scrollTo({ top: 0, behavior: 'auto' })
  }, [loading, err])

  const answersByQid: Record<string, AttemptAnswer> = useMemo(() => {
    const map: Record<string, AttemptAnswer> = {}
    const list = data?.attempt?.answers ?? []
    for (const a of list) {
      const qid = normId(a?.questionId)
      if (qid) map[qid] = a
    }
    return map
  }, [data?.attempt?.answers])

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="h-36 animate-pulse rounded-2xl bg-gray-100" />
      </div>
    )
  }
  if (err) {
    return (
      <div className="mx-auto max-w-3xl p-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
        {err}
      </div>
    )
  }
  if (!data) return null

  const { attempt, quiz, results } = data
  const passTone = attempt.passed
    ? 'border-emerald-200 bg-emerald-50'
    : 'border-amber-200 bg-amber-50'
  const passText = attempt.passed ? 'text-emerald-700' : 'text-amber-700'
  const barPct = Math.min(100, Math.max(0, attempt.percent))

  const Stat = ({
    label,
    value,
    tone = 'neutral' as 'neutral' | 'green' | 'red'
  }) => {
    const base =
      'inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium'
    const toneCls =
      tone === 'green'
        ? 'bg-emerald-100 text-emerald-800'
        : tone === 'red'
        ? 'bg-red-100 text-red-800'
        : 'bg-gray-100 text-gray-800'
    return (
      <div className={`${base} ${toneCls}`}>
        <span className="opacity-80">{label}:</span>
        <span>{value}</span>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-5">
      {/* Header card */}
      <div className={`rounded-2xl border ${passTone} p-5 shadow-sm`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{quiz.title}</h1>
            <div className="mt-2 flex flex-wrap gap-2">
              <Stat label="Score" value={`${attempt.score}/${attempt.maxScore}`} />
              <Stat
                label="Percent"
                value={`${attempt.percent}%`}
                tone={attempt.passed ? 'green' : 'red'}
              />
              <Stat
                label="Result"
                value={attempt.passed ? 'Passed' : 'Not passed'}
                tone={attempt.passed ? 'green' : 'red'}
              />
              <Stat label="Questions" value={results.perQuestion.length} />
              <Stat label="Time" value={`${attempt.timeTakenSec}s`} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link to={`/quizzes/${quiz.slug}`} className="rounded-md border px-3 py-1.5 text-sm hover:bg-white/70">
              Back to quiz
            </Link>
            <Link
              to={`/quizzes/attempts/${attempt.id}`}
              className="rounded-md border px-3 py-1.5 text-sm hover:bg-white/70"
            >
              Past attempts
            </Link>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span className={passText}>{attempt.passed ? 'Great job!' : 'Keep practicing'}</span>
            <span>{barPct}%</span>
          </div>
          <div className="mt-1.5 h-2 w-full rounded-full bg-white/70">
            <div
              className={`h-2 rounded-full transition-[width] duration-500 ${attempt.passed ? 'bg-emerald-500' : 'bg-amber-500'}`}
              style={{ width: `${barPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-3">
        {results.perQuestion.map((q, idx) => {
          const qid = normId(q.id)
          const ans = answersByQid[qid] || {}
          const selected = new Set((ans.selectedOptionIds || []).map(normId))
          const correct = new Set((q.correctOptionIds || []).map(normId))
          const optionMap: Record<string, string> = {}
          for (const o of q.options || []) optionMap[normId(o.id)] = o.text || ''

          const borderTone = q.grade.correct
            ? 'border-emerald-200'
            : 'border-red-200'

          return (
            <details
              key={qid}
              open
              className={`group rounded-xl border ${borderTone} bg-white p-4 shadow-sm`}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                <div>
                  <div className="mb-1 text-xs text-gray-500">
                    {idx + 1} / {results.perQuestion.length} • {q.points} pt{q.points !== 1 ? 's' : ''}{' '}
                    <span className={q.grade.correct ? 'text-emerald-700' : 'text-red-700'}>
                      · {q.grade.correct ? `Correct (+${q.grade.earned})` : `Incorrect (+${q.grade.earned})`}
                    </span>
                  </div>
                  <div className="font-medium">{q.prompt}</div>
                </div>
                <span className="rounded-md border px-2 py-0.5 text-xs text-gray-600 group-open:hidden">
                  Collapse ▾
                </span>
                <span className="hidden rounded-md border px-2 py-0.5 text-xs text-gray-600 group-open:inline">
                  Expand ▸
                </span>
              </summary>

              <div className="mt-3 space-y-3 text-sm text-gray-800">
              <QuestionMedia media={(q as any).media} />

                {(q.type === 'mcq' || q.type === 'multi') && (
                  <>
                    {/* Your answers */}
                    <Section title={`Your answer${selected.size > 1 ? 's' : ''}`}>
                      {selected.size === 0 ? (
                        <Muted>(no answer)</Muted>
                      ) : (
                        <ChipRow>
                          {Array.from(selected).map((id) => {
                            const isRight = correct.has(id)
                            return (
                              <Chip key={id} tone={isRight ? 'green' : 'red'}>
                                {labelWithText(id, optionMap[id])}
                              </Chip>
                            )
                          })}
                        </ChipRow>
                      )}
                    </Section>

                    {/* Correct answers */}
                    <Section title={`Correct answer${correct.size > 1 ? 's' : ''}`}>
                      {correct.size === 0 ? (
                        <Muted>—</Muted>
                      ) : (
                        <ChipRow>
                          {Array.from(correct).map((id) => (
                            <Chip key={id} tone="green">
                              {labelWithText(id, optionMap[id])}
                            </Chip>
                          ))}
                        </ChipRow>
                      )}
                    </Section>

                    {/* Full list */}
                    {q.options?.length ? (
          <ul className="mt-2 space-y-1">
            {q.options.map(o => {
              const id = normId(o.id);
              const isSel = selected.has(id);
              const isCor = correct.has(id);
              const base = 'rounded-md border px-2 py-2 flex items-start gap-2';
              const row =
                isSel && isCor ? `${base} border-emerald-200 bg-emerald-50` :
                isSel && !isCor ? `${base} border-red-200 bg-red-50` :
                !isSel && isCor ? `${base} border-emerald-200 bg-emerald-50/40` :
                `${base} border-gray-200`;

              return (
                <li key={id} className={row}>
                  <span className={`mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded border text-xs ${
                    isCor ? 'border-emerald-300 text-emerald-700' : 'border-gray-300 text-gray-500'
                  }`}>
                    {id}
                  </span>
                  <div className="flex-1 leading-5">
                    <div className="flex items-center gap-2">
                      <span>{o.text}</span>
                      {isSel && isCor && <span aria-hidden>✓</span>}
                      {isSel && !isCor && <span aria-hidden>✗</span>}
                    </div>
                    {/* render option images */}
                    <OptionMedia media={(o as any).media} />
                  </div>
                </li>
              );
            })}
          </ul>
        ) : null}
      </>
    )}
                

                {q.type === 'boolean' && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Section title="Your answer">
                      <span className={ans.booleanAnswer === q.correctBoolean ? 'text-emerald-700' : 'text-red-700'}>
                        <b>{String(ans.booleanAnswer)}</b>
                      </span>
                    </Section>
                    <Section title="Correct answer">
                      <span className="text-emerald-700">
                        <b>{String(q.correctBoolean)}</b>
                      </span>
                    </Section>
                  </div>
                )}

                {q.type === 'short' && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Section title="Your answer">
                      <span className={q.grade.correct ? 'text-emerald-700' : 'text-red-700'}>
                        <b>{ans.textAnswer || '(no answer)'}</b>
                      </span>
                    </Section>
                    <Section title="Accepted answers">
                      <span className="text-emerald-700">
                        <b>{(q.correctText || []).join(', ') || '—'}</b>
                      </span>
                    </Section>
                  </div>
                )}
              </div>

              {q.explanation && (
                <div className="mt-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Explanation
                  </div>
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
          className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
        >
          Back to top ↑
        </button>
      </div>
    </div>
  )
}

/* -------- tiny presentational helpers -------- */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500">{title}</div>
      {children}
    </div>
  )
}
function Chip({ children, tone = 'neutral' as 'neutral' | 'green' | 'red' }) {
  const base = 'inline-flex items-center rounded px-2 py-0.5 text-xs'
  const cls =
    tone === 'green'
      ? 'bg-emerald-100 text-emerald-800'
      : tone === 'red'
      ? 'bg-red-100 text-red-800'
      : 'bg-gray-100 text-gray-800'
  return <span className={`${base} ${cls}`}>{children}</span>
}
function ChipRow({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children}</div>
}
function Muted({ children }: { children: React.ReactNode }) {
  return <span className="text-gray-600">{children}</span>
}
function labelWithText(id: string, text?: string) {
  return text && text.trim().length ? `${id} — ${text}` : id
}
