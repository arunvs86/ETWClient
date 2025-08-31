import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { listPublishedQuizzes, type QuizListResp } from '@/lib/publicQuizzes.api'

function useQueryParams() {
  const [sp, setSp] = useSearchParams()
  const q = sp.get('q') ?? ''
  const page = Math.max(1, parseInt(sp.get('page') || '1', 10) || 1)
  const limit = Math.min(50, Math.max(1, parseInt(sp.get('limit') || '12', 10) || 12))
  const set = (next: Record<string, string | number | undefined | null>) => {
    const clone = new URLSearchParams(sp)
    Object.entries(next).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '') clone.delete(k)
      else clone.set(k, String(v))
    })
    if ('q' in next) clone.set('page', '1')
    setSp(clone, { replace: true })
  }
  return { q, page, limit, set }
}

export default function PublicQuizListPage() {
  const { q, page, limit, set } = useQueryParams()
  const [input, setInput] = useState(q)
  useEffect(() => setInput(q), [q])
  useEffect(() => {
    const t = setTimeout(() => { if (input !== q) set({ q: input }) }, 300)
    return () => clearTimeout(t)
  }, [input]) // eslint-disable-line

  const queryKey = useMemo(() => ['pubQuizzes', { q, page, limit }], [q, page, limit])
  const { data, isLoading, isError, error, isFetching, refetch } = useQuery<QuizListResp>({
    queryKey,
    queryFn: () => listPublishedQuizzes({ q, page, limit }),
    keepPreviousData: true,
    staleTime: 10_000,
  })

  const items = data?.items ?? []

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Quizzes</h1>
      </div>

      <div className="relative w-full sm:w-96">
        <input
          className="w-full h-10 rounded-md border border-gray-300 px-3 pr-8"
          placeholder="Search…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        {isFetching && (
          <div className="absolute right-2 top-2 h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-28 animate-pulse rounded-lg bg-gray-100" />)}
        </div>
      ) : isError ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
          Failed to load. {(error as any)?.message || ''}
          <div><button className="mt-2 underline" onClick={() => refetch()}>Retry</button></div>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-md border border-gray-200 p-8 text-center text-gray-600">No quizzes found.</div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map(q => (
              <Link key={q.id} to={`/quizzes/${q.slug}`} className="rounded-lg border bg-white p-4 hover:shadow-sm">
                <div className="font-medium">{q.title}</div>
                <div className="mt-1 line-clamp-2 text-sm text-gray-600">{q.description}</div>
                <div className="mt-2 text-xs text-gray-500">
                  {q.questionCount} questions • {q.totalPoints} pts • Pass {q.passPercent}%
                </div>
              </Link>
            ))}
          </div>

          <Pagination
            page={data?.meta.page ?? 1}
            hasNext={Boolean(data?.meta.hasNextPage)}
            onPrev={() => set({ page: Math.max(1, page - 1) })}
            onNext={() => set({ page: (page + 1) })}
          />
        </>
      )}
    </div>
  )
}

function Pagination({ page, hasNext, onPrev, onNext }: { page: number; hasNext: boolean; onPrev: () => void; onNext: () => void }) {
  return (
    <div className="mt-4 flex items-center justify-center gap-2">
      <button onClick={onPrev} disabled={page <= 1} className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50">← Prev</button>
      <div className="text-sm text-gray-600">Page {page}</div>
      <button onClick={onNext} disabled={!hasNext} className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50">Next →</button>
    </div>
  )
}
