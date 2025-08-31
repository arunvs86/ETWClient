import { Link, useSearchParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { listMyQuizzes, type InstructorQuiz, type MyQuizzesResponse } from '@/lib/instructorQuizzes.api'

function useQueryParams() {
  const [sp, setSp] = useSearchParams()
  const q = sp.get('q') ?? ''
  const filter = (sp.get('filter') as 'all'|'published'|'unpublished'|null) ?? 'all'
  const page = Math.max(1, parseInt(sp.get('page') || '1', 10) || 1)
  const limit = Math.min(50, Math.max(1, parseInt(sp.get('limit') || '12', 10) || 12))

  const set = (next: Record<string, string | number | undefined | null>) => {
    const clone = new URLSearchParams(sp)
    Object.entries(next).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '') clone.delete(k)
      else clone.set(k, String(v))
    })
    if ('filter' in next || 'q' in next) clone.set('page', '1')
    setSp(clone, { replace: true })
  }
  return { q, filter, page, limit, set }
}

export default function MyQuizzesPage() {
  const { q, filter, page, limit, set } = useQueryParams()
  const [input, setInput] = useState(q)
  useEffect(() => setInput(q), [q])
  useEffect(() => {
    const t = setTimeout(() => { if (input !== q) set({ q: input }) }, 300)
    return () => clearTimeout(t)
  }, [input]) // eslint-disable-line

  const queryKey = useMemo(() => ['myQuizzes', { q, page, limit }], [q, page, limit])

  const { data, isLoading, isError, error, isFetching, refetch } = useQuery<MyQuizzesResponse>({
    queryKey,
    queryFn: () => listMyQuizzes({ q, page, limit }),
    keepPreviousData: true,
    staleTime: 15_000
  })

  const allItems = data?.items ?? []
  const items = useMemo(() => {
    if (filter === 'published') return allItems.filter(x => x.isPublished)
    if (filter === 'unpublished') return allItems.filter(x => !x.isPublished)
    return allItems
  }, [allItems, filter])

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-semibold">My Quizzes</h1>
        <Link to="/instructor/quizzes/new" className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-white hover:opacity-95">
          + New quiz
        </Link>
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex rounded-md border border-gray-200 overflow-hidden">
          {(['all','published','unpublished'] as const).map(tab => {
            const active = (filter ?? 'all') === tab
            return (
              <button
                key={tab}
                onClick={() => set({ filter: tab })}
                className={`px-3 py-2 text-sm ${active ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} ${tab !== 'unpublished' ? 'border-right border-gray-200' : ''}`}
              >
                {tab[0].toUpperCase() + tab.slice(1)}
              </button>
            )
          })}
        </div>

        <div className="relative w-full sm:w-80">
          <input
            className="w-full h-10 rounded-md border border-gray-300 px-3 pr-8"
            placeholder="Search by title…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          {isFetching && (
            <div className="absolute right-2 top-2 h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
          )}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid gap-3 sm:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 w-full animate-pulse rounded-md bg-gray-100" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
          Failed to load quizzes. {(error as any)?.message || ''}
          <div><button className="mt-2 underline" onClick={() => refetch()}>Retry</button></div>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-md border border-gray-200 p-8 text-center">
          <div className="text-lg font-medium">No quizzes yet</div>
          <div className="mt-1 text-sm text-gray-600">Create your first standalone quiz.</div>
          <Link to="/instructor/quizzes/new" className="mt-4 inline-flex h-10 items-center rounded-md bg-primary px-4 text-white hover:opacity-95">
            + New quiz
          </Link>
        </div>
      ) : (
        <>
          <div className="hidden md:block overflow-hidden rounded-md border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Quiz</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Questions</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Updated</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {items.map((q) => (
                  <tr key={q.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium">{q.title}</div>
                      <div className="text-xs text-gray-500">/{q.slug}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${q.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {q.isPublished ? 'Published' : 'Unpublished'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{q.questionCount} • {q.totalPoints} pts</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {q.updatedAt ? new Date(q.updatedAt).toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <Link to={`/instructor/quizzes/${q.id}`} className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50">Edit</Link>
                      <Link to={`/instructor/quizzes/${q.id}/questions`} className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50">Questions</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {items.map((q) => (
              <div key={q.id} className="rounded-md border border-gray-200 bg-white p-3">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{q.title}</div>
                    <div className="text-xs text-gray-500">/{q.slug}</div>
                  </div>
                  <span className={`ml-2 inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${q.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {q.isPublished ? 'Published' : 'Unpublished'}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-gray-600">
                  <div>{q.questionCount} questions • {q.totalPoints} pts</div>
                  <div>{q.updatedAt ? new Date(q.updatedAt).toLocaleDateString() : '—'}</div>
                </div>
                <div className="mt-2 flex gap-2">
                  <Link to={`/instructor/quizzes/${q.id}`} className="rounded-md border px-3 py-1.5 text-sm">Edit</Link>
                  <Link to={`/instructor/quizzes/${q.id}/questions`} className="rounded-md border px-3 py-1.5 text-sm">Questions</Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
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
