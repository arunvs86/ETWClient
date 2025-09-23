

// src/pages/quizzes/QuizPlayPage.tsx
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { getAttempt, startAttempt, submitAttempt } from '@/lib/publicQuizzes.api'
import type { PlayQuestion, QuizPublic } from '@/lib/publicQuizzes.api'
import QuestionRenderer, { type AnswerValue } from '@/components/quiz/QuestionRenderer'
import QuizTimer from '@/components/quiz/QuizTimer'
import useAttemptAutosave from '@/hooks/useAttemptAutosave'

type NavState = {
  attempt?: { id: string; status: 'in_progress'|'submitted'; startedAt: string; timeLimitSec: number; expiresAt: string | null }
  quiz?: QuizPublic
  questions?: PlayQuestion[]
}

export default function QuizPlayPage() {
  const { slug = '' } = useParams()
  const nav = useNavigate()
  const loc = useLocation()
  const state = (loc.state || {}) as NavState

  const [attemptId, setAttemptId] = useState<string | null>(state.attempt?.id || null)
  const [startedAt, setStartedAt] = useState<string | null>(state.attempt?.startedAt || null)
  const [expiresAt, setExpiresAt] = useState<string | null>(state.attempt?.expiresAt ?? null)
  const [timeLimitSec, setTimeLimitSec] = useState<number>(state.attempt?.timeLimitSec || 0)

  const [quiz, setQuiz] = useState<QuizPublic | null>(state.quiz || null)
  const [questions, setQuestions] = useState<PlayQuestion[]>(state.questions || [])
  const [loading, setLoading] = useState<boolean>(!state.attempt)
  const [err, setErr] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // answers map (questionId -> AnswerValue)
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({})

  // On mount: resume if attemptId in state or localStorage; else start fresh
  useEffect(() => {
    (async () => {
      try {
        if (!attemptId) {
          const cached = localStorage.getItem(`quizAttempt:${slug}`)
          if (cached) setAttemptId(cached)
        }
        const existing = attemptId || (localStorage.getItem(`quizAttempt:${slug}`) as string | null)
        if (existing) {
          const resp = await getAttempt(existing)
          if (resp.attempt.status === 'submitted') {
            window.scrollTo({ top: 0, behavior: 'auto' })
            nav(`/quizzes/attempts/${existing}`, { replace: true })
            return
          }
          setAttemptId(resp.attempt.id)
          setStartedAt(resp.attempt.startedAt)
          setQuiz(resp.quiz)
          setQuestions(resp.questions)
          setTimeLimitSec(resp.quiz.timeLimitSec || 0)
          setExpiresAt(null) // derive from startedAt + timeLimit
        } else {
          const resp = await startAttempt(slug)
          setAttemptId(resp.attempt.id)
          setStartedAt(resp.attempt.startedAt)
          setExpiresAt(resp.attempt.expiresAt)
          setTimeLimitSec(resp.attempt.timeLimitSec)
          setQuiz(resp.quiz)
          setQuestions(resp.questions)
          localStorage.setItem(`quizAttempt:${slug}`, resp.attempt.id)
        }
      } catch (e: any) {
        setErr(e?.response?.data?.message || 'Could not start/resume attempt')
      } finally {
        setLoading(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function MediaStrip({ media }: { media?: Array<{ kind: string; url: string; alt?: string }> }) {
    if (!media || media.length === 0) return null;
    const imgs = media.filter((m) => m.kind === 'image' && m.url);
    if (imgs.length === 0) return null;
    return (
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
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


  // Build payload for autosave on every change
  const answerArray = useMemo(
    () =>
      Object.entries(answers).map(([questionId, v]) => {
        const out: any = { questionId }
        if ('selectedOptionIds' in v) out.selectedOptionIds = v.selectedOptionIds
        if ('booleanAnswer' in v) out.booleanAnswer = v.booleanAnswer
        if ('textAnswer' in v) out.textAnswer = v.textAnswer
        return out
      }),
    [answers]
  )

  const autosave = useAttemptAutosave({
    attemptId,
    answers: answerArray,
    enabled: !!attemptId,
    debounceMs: 800,
  })

  async function onSubmit() {
    if (!attemptId) return
    setSubmitting(true)
    try {
      await autosave.flush()
      const resp = await submitAttempt(attemptId)
      localStorage.removeItem(`quizAttempt:${slug}`)
      // land at top of results
      window.scrollTo({ top: 0, behavior: 'auto' })
      nav(`/quizzes/attempts/${attemptId}`, { replace: true, state: { data: resp } })
    } catch (e: any) {
      setErr(e?.response?.data?.message || 'Submit failed')
    } finally {
      setSubmitting(false)
    }
  }

  function onExpire() {
    if (!attemptId || submitting) return
    onSubmit()
  }

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
  if (!quiz || !questions.length || !startedAt) return null

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">{quiz.title}</h1>
          <div className="text-xs text-gray-600">{questions.length} questions • pass {quiz.passPercent}%</div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={autosave.status} lastSavedAt={autosave.lastSavedAt} />
          <QuizTimer startedAt={startedAt} timeLimitSec={timeLimitSec} expiresAt={expiresAt} onExpire={onExpire} />
        </div>
      </div>

      <div className="space-y-4">
        {questions.map((q, idx) => (
          <div key={q.id} className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="mb-2 text-xs text-gray-500">
              {idx + 1} / {questions.length} • {q.points} pt{q.points !== 1 ? 's' : ''}
            </div>
            <div className="mb-3 font-medium">{q.prompt}</div>
            {/* <MediaStrip media={q.media} /> */}
            <QuestionRenderer
              q={q}
              value={answers[q.id]}
              onChange={(val) => setAnswers((prev) => ({ ...prev, [q.id]: val }))}
            />
          </div>
        ))}
      </div>

      {/* Sticky submit bar */}
      <div className="sticky bottom-0 z-10 border-t bg-white/70 p-4 backdrop-blur supports-[backdrop-filter]:bg-white/50">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-between">
            {autosave.error ? <div className="text-sm text-red-600">{autosave.error}</div> : <span />}
            <button
              onClick={onSubmit}
              disabled={submitting}
              className="rounded-md bg-primary px-4 py-2 text-sm text-white"
            >
              {submitting ? 'Submitting…' : 'Submit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({
  status,
  lastSavedAt,
}: {
  status: ReturnType<typeof useAttemptAutosave>['status']
  lastSavedAt: Date | null
}) {
  const map: Record<string, { cls: string; label: string }> = {
    idle: { cls: 'bg-gray-100 text-gray-700', label: 'Idle' },
    saving: { cls: 'bg-amber-100 text-amber-800', label: 'Saving…' },
    saved: {
      cls: 'bg-emerald-100 text-emerald-800',
      label: lastSavedAt ? `Saved • ${lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Saved',
    },
    error: { cls: 'bg-red-100 text-red-800', label: 'Autosave failed' },
  }
  const o = map[status] || map.idle
  return <span className={`rounded px-2 py-0.5 text-xs ${o.cls}`}>{o.label}</span>
}
