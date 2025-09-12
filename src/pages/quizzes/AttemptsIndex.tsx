// src/pages/quizzes/AttemptsIndex.tsx
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { listMyAttemptsAll, type AttemptLite, type QuizLite } from '@/lib/meAttempts.api'

export default function AttemptsIndex() {
  const [sp, setSp] = useSearchParams()
  const q = sp.get('q') ?? ''
  const page = Math.max(1, parseInt(sp.get('page') || '1', 10) || 1)
  const limit = 12

  const setQP = (next: Record<string, string | number | undefined | null>) => {
    const clone = new URLSearchParams(sp)
    Object.entries(next).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '') clone.delete(k)
      else clone.set(k, String(v))
    })
    setSp(clone, { replace: true })
  }

  const [input, setInput] = useState(q)
  useEffect(() => setInput(q), [q])
  useEffect(() => {
    const t = setTimeout(() => { if (input !== q) setQP({ q: input, page: 1 }) }, 300)
    return () => clearTimeout(t)
  }, [input]) // eslint-disable-line

  const { data, isLoading, isError, error, isFetching, refetch } = useQuery({
    queryKey: ['myAttemptsAll', { page, limit, q }],
    queryFn: () => listMyAttemptsAll({ page, limit, q }),
    keepPreviousData: true,
    staleTime: 10_000,
  })

  const items = data?.items ?? []
  const hasNext = Boolean(data?.meta?.hasNextPage)
  const total = data?.meta?.total ?? undefined

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 space-y-5">
      {/* Header + search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold">Your attempts</h1>
          <p className="mt-0.5 text-sm text-gray-600">View and revisit results for quizzes you’ve taken.</p>
        </div>
        <div className="w-full sm:w-[28rem]">
          <div className="relative">
            <input
              className="h-11 w-full rounded-xl border border-gray-300 px-3 pr-24 text-sm outline-none transition focus:ring-2 focus:ring-primary/30"
              placeholder="Search by quiz title…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <div className="pointer-events-none absolute right-2 top-2">
              {isFetching ? (
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
              ) : (
                <span className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600">
                  {typeof total === 'number' ? `${total} attempt${total === 1 ? '' : 's'}` : 'Ready'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* States */}
      {isLoading ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-xl border border-gray-200 bg-gray-100" />
            ))}
          </div>
          <div className="mt-3 h-10 w-48 animate-pulse rounded-md bg-gray-100" />
        </>
      ) : isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          <div className="font-medium">Failed to load.</div>
          <div className="text-sm opacity-90">{(error as any)?.message || 'Unknown error'}</div>
          <button className="mt-2 w-full rounded-md border px-3 py-2 text-sm sm:w-auto" onClick={() => refetch()}>
            Retry
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-full bg-gray-100">📝</div>
          <div className="font-medium">No attempts found</div>
          <p className="mt-1 text-sm text-gray-600">Start a quiz to see your attempts here.</p>
          <div className="mt-3">
            <Link to="/quizzes" className="inline-block w-full rounded-md border px-3 py-2 text-sm sm:w-auto">
              Browse quizzes
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((a) => (
              <AttemptCard key={a.id} attempt={a} />
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-5 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-center">
            <div className="flex gap-2">
              <button
                onClick={() => setQP({ page: Math.max(1, page - 1) })}
                disabled={page <= 1}
                className="flex-1 rounded-md border px-3 py-2 text-sm disabled:opacity-50 sm:flex-none"
              >
                ← Prev
              </button>
              <button
                onClick={() => setQP({ page: page + 1 })}
                disabled={!hasNext}
                className="flex-1 rounded-md border px-3 py-2 text-sm disabled:opacity-50 sm:flex-none"
              >
                Next →
              </button>
            </div>
            <div className="rounded-md border bg-white px-3 py-2 text-center text-sm text-gray-700 shadow-sm sm:min-w-[7rem]">
              Page {page}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

/* ---- UI bits ---- */
function StatusChip({ status, passed }: { status: AttemptLite['status']; passed?: boolean }) {
  if (status === 'in_progress') return <span className="whitespace-nowrap rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">In progress</span>
  if (passed === true) return <span className="whitespace-nowrap rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">Passed</span>
  if (passed === false) return <span className="whitespace-nowrap rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700">Not passed</span>
  return <span className="whitespace-nowrap rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">Submitted</span>
}

function AttemptCard({ attempt }: { attempt: AttemptLite & { quiz: QuizLite } }) {
  const started = attempt.startedAt ? new Date(attempt.startedAt) : null
  const completed = attempt.completedAt ? new Date(attempt.completedAt) : null
  const when = completed || started
  const whenFmt = when
    ? when.toLocaleString([], { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })
    : '—'

  const scoreLabel =
    attempt.status === 'submitted' && typeof attempt.score === 'number' && typeof attempt.maxScore === 'number'
      ? `${attempt.score}/${attempt.maxScore} • ${attempt.percent ?? Math.round(((attempt.score || 0) / (attempt.maxScore || 1)) * 100)}%`
      : '—'

  return (
    <div className="flex h-full flex-col justify-between rounded-xl border bg-white p-4 shadow-sm">
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-sm text-gray-500">{whenFmt}</div>
            <div className="mt-0.5 line-clamp-2 break-words font-medium">{attempt.quiz.title}</div>
          </div>
          <StatusChip status={attempt.status} passed={attempt.passed} />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <KV label="Attempt #" value={attempt.attemptNo ? String(attempt.attemptNo) : '—'} />
          <KV label="Time taken" value={attempt.timeTakenSec ? `${attempt.timeTakenSec}s` : '—'} />
          <KV label="Score" value={scoreLabel} />
          <KV label="Status" value={attempt.status === 'submitted' ? 'Submitted' : 'In progress'} />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
        {attempt.status === 'submitted' ? (
          <Link to={`/quizzes/attempts/${attempt.id}`} className="rounded-md border px-3 py-2 text-center text-sm sm:w-auto">
            View results
          </Link>
        ) : (
          <span className="rounded-md border px-3 py-2 text-center text-sm text-gray-500 sm:w-auto">
            Resume from quiz page
          </span>
        )}
        <Link to={`/quizzes/${attempt.quiz.slug}`} className="rounded-md border px-3 py-2 text-center text-sm sm:w-auto">
          Open quiz
        </Link>
      </div>
    </div>
  )
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-gray-50 px-3 py-2">
      <div className="truncate text-xs text-gray-500">{label}</div>
      <div className="truncate font-medium text-gray-800">{value}</div>
    </div>
  )
}
