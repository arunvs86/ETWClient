// import { useEffect, useMemo, useState } from 'react'
// import { Link, useSearchParams } from 'react-router-dom'
// import { useQuery } from '@tanstack/react-query'
// import { listPublishedQuizzes, type QuizListResp } from '@/lib/publicQuizzes.api'
// import {
//   Loader2,
//   Search,
//   X,
//   BookOpenCheck,
//   AlertCircle,
//   HelpCircle,
//   ListChecks,
//   Trophy,
// } from 'lucide-react'

// function useQueryParams() {
//   const [sp, setSp] = useSearchParams()
//   const q = sp.get('q') ?? ''
//   const page = Math.max(1, parseInt(sp.get('page') || '1', 10) || 1)
//   const limit = Math.min(50, Math.max(1, parseInt(sp.get('limit') || '12', 10) || 12))
//   const set = (next: Record<string, string | number | undefined | null>) => {
//     const clone = new URLSearchParams(sp)
//     Object.entries(next).forEach(([k, v]) => {
//       if (v === undefined || v === null || v === '') clone.delete(k)
//       else clone.set(k, String(v))
//     })
//     if ('q' in next) clone.set('page', '1')
//     setSp(clone, { replace: true })
//   }
//   return { q, page, limit, set }
// }

// export default function PublicQuizListPage() {
//   const { q, page, limit, set } = useQueryParams()

//   // local input state + debounce to sync URL ?q=
//   const [input, setInput] = useState(q)
//   useEffect(() => setInput(q), [q])
//   useEffect(() => {
//     const t = setTimeout(() => { if (input !== q) set({ q: input }) }, 300)
//     return () => clearTimeout(t)
//   }, [input]) // eslint-disable-line

//   const queryKey = useMemo(() => ['pubQuizzes', { q, page, limit }], [q, page, limit])
//   const { data, isLoading, isError, error, isFetching, refetch } = useQuery<QuizListResp>({
//     queryKey,
//     queryFn: () => listPublishedQuizzes({ q, page, limit }),
//     keepPreviousData: true,
//     staleTime: 10_000,
//   })

//   const items = data?.items ?? []
//   const total = data?.meta?.total ?? undefined

//   return (
//     <div className="mx-auto max-w-6xl p-4 sm:p-6 space-y-5">
//       {/* Header */}
//       <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
//         <div>
//           <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
//             <BookOpenCheck className="h-6 w-6 text-primary" />
//             Quizzes
//           </h1>
//           <p className="mt-0.5 text-sm text-gray-600">
//             Browse public quizzes and test your knowledge.
//           </p>
//         </div>
//         {/* Search + status */}
//         <div className="w-full sm:w-[28rem]">
//           <div className="relative">
//             <Search className="pointer-events-none absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
//             <input
//               className="h-10 w-full rounded-full border border-gray-300 pl-10 pr-20 text-sm outline-none transition focus:ring-2 focus:ring-primary/30"
//               placeholder="Search quizzes…"
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//             />
//             {input ? (
//               <button
//                 onClick={() => setInput('')}
//                 className="absolute right-10 top-1.5 rounded-md p-1 text-gray-500 hover:bg-gray-100"
//                 aria-label="Clear"
//               >
//                 <X className="h-5 w-5" />
//               </button>
//             ) : null}
//             <div className="absolute right-2 top-2">
//               {isFetching ? (
//                 <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
//               ) : (
//                 <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
//                   {typeof total === 'number' ? `${total} result${total === 1 ? '' : 's'}` : 'Ready'}
//                 </span>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Content */}
//       {isLoading ? (
//         <>
//           <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
//             {Array.from({ length: 6 }).map((_, i) => (
//               <div key={i} className="h-28 animate-pulse rounded-xl border border-gray-200 bg-gray-100" />
//             ))}
//           </div>
//         </>
//       ) : isError ? (
//         <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
//           <div className="flex items-start gap-2">
//             <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
//             <div>
//               <div className="font-medium">Failed to load.</div>
//               <div className="text-sm opacity-90">{(error as any)?.message || 'Unknown error'}</div>
//               <button
//                 className="mt-2 rounded-md border px-3 py-1.5 text-sm"
//                 onClick={() => refetch()}
//               >
//                 Retry
//               </button>
//             </div>
//           </div>
//         </div>
//       ) : items.length === 0 ? (
//         <div className="rounded-2xl border bg-white p-8 text-center shadow-sm">
//           <div className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-full bg-gray-100">
//             <HelpCircle className="h-6 w-6 text-gray-500" />
//           </div>
//           <div className="font-medium">No quizzes found</div>
//           <p className="mt-1 text-sm text-gray-600">
//             Try a different keyword or clear the search.
//           </p>
//           {q ? (
//             <button
//               onClick={() => set({ q: '' })}
//               className="mt-3 rounded-md border px-3 py-1.5 text-sm"
//             >
//               Clear search
//             </button>
//           ) : null}
//         </div>
//       ) : (
//         <>
//           {/* Grid */}
//           <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
//             {items.map((qz) => (
//               <Link
//                 key={qz.id}
//                 to={`/quizzes/${qz.slug}`}
//                 className="group relative overflow-hidden rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md"
//               >
//                 <div className="flex items-start justify-between gap-3">
//                   <div className="min-w-0">
//                     <div className="font-medium leading-5 group-hover:underline flex items-center gap-2">
//                       <BookOpenCheck className="h-4 w-4 text-primary" />
//                       {qz.title}
//                     </div>
//                     <div className="mt-1 line-clamp-2 text-sm text-gray-600">
//                       {qz.description}
//                     </div>
//                   </div>
//                 </div>

//                 <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-600">
//                   <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5">
//                     <ListChecks size={14} /> {qz.questionCount} Qs
//                   </span>
//                   <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5">
//                     <Trophy size={14} /> {qz.totalPoints} pts
//                   </span>
//                   <span className="rounded-full bg-gray-100 px-2 py-0.5">
//                     Pass {qz.passPercent}%
//                   </span>
//                 </div>

//                 {/* subtle gradient accent */}
//                 <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-primary/30 via-transparent to-primary/30 opacity-0 transition-opacity group-hover:opacity-100" />
//               </Link>
//             ))}
//           </div>

//           <Pagination
//             page={data?.meta.page ?? 1}
//             hasNext={Boolean(data?.meta.hasNextPage)}
//             onPrev={() => set({ page: Math.max(1, page - 1) })}
//             onNext={() => set({ page: page + 1 })}
//           />
//         </>
//       )}
//     </div>
//   )
// }

// function Pagination({
//   page,
//   hasNext,
//   onPrev,
//   onNext,
// }: {
//   page: number
//   hasNext: boolean
//   onPrev: () => void
//   onNext: () => void
// }) {
//   return (
//     <div className="mt-5 flex items-center justify-center gap-2">
//       <button
//         onClick={onPrev}
//         disabled={page <= 1}
//         className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
//       >
//         ← Prev
//       </button>
//       <div className="rounded-md border bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm">
//         Page {page}
//       </div>
//       <button
//         onClick={onNext}
//         disabled={!hasNext}
//         className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
//       >
//         Next →
//       </button>
//     </div>
//   )
// }


import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { listPublishedQuizzes, type QuizListResp } from '@/lib/publicQuizzes.api'
import {
  Loader2,
  Search,
  X,
  BookOpenCheck,
  AlertCircle,
  HelpCircle,
  ListChecks,
  Trophy,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

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

  // local input state + debounce to sync URL ?q=
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
  const total = data?.meta?.total ?? undefined

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="rounded-2xl border bg-gradient-to-br from-white to-gray-50 p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
              <BookOpenCheck className="h-6 w-6 text-primary" />
              Quizzes
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Browse public quizzes and test your knowledge.
            </p>
          </div>

          {/* Search + status */}
          <div className="w-full sm:w-[30rem]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                className="h-10 w-full rounded-full border border-gray-300 bg-white/90 pl-10 pr-24 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20"
                placeholder="Search quizzes…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              {input ? (
                <button
                  onClick={() => setInput('')}
                  className="absolute right-12 top-1.5 rounded-md p-1 text-gray-500 hover:bg-gray-100"
                  aria-label="Clear"
                >
                  <X className="h-5 w-5" />
                </button>
              ) : null}
              <div className="absolute right-2 top-2">
                {isFetching ? (
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                ) : (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                    {typeof total === 'number' ? `${total} result${total === 1 ? '' : 's'}` : 'Ready'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="relative overflow-hidden rounded-xl border bg-white shadow-sm">
              <div className="h-28">
                <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <div className="font-medium">Failed to load</div>
              <div className="text-sm opacity-90">{(error as any)?.message || 'Unknown error'}</div>
              <button
                className="mt-3 rounded-lg border bg-white px-3 py-1.5 text-sm hover:bg-red-100/40"
                onClick={() => refetch()}
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-gray-100">
            <HelpCircle className="h-6 w-6 text-gray-500" />
          </div>
          <div className="font-medium">No quizzes found</div>
          <p className="mt-1 text-sm text-gray-600">Try a different keyword or clear the search.</p>
          {q ? (
            <button
              onClick={() => set({ q: '' })}
              className="mt-3 rounded-lg border bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
            >
              Clear search
            </button>
          ) : null}
        </div>
      ) : (
        <>
          {/* Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((qz) => (
              <Link
                key={qz.id}
                to={`/quizzes/${qz.slug}`}
                className="group relative overflow-hidden rounded-2xl border bg-white p-4 shadow-sm ring-1 ring-black/0 transition hover:shadow-md hover:ring-black/5"
              >
                {/* Title + desc */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium leading-5 flex items-center gap-2">
                      <span className="grid h-6 w-6 place-items-center rounded-lg bg-primary/10">
                        <BookOpenCheck className="h-4 w-4 text-primary" />
                      </span>
                      <span className="truncate group-hover:underline">{qz.title}</span>
                    </div>
                    <div className="mt-1 line-clamp-2 text-sm text-gray-600">{qz.description}</div>
                  </div>
                </div>

                {/* Meta pills */}
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-700">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5">
                    <ListChecks size={14} /> {qz.questionCount} Qs
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5">
                    <Trophy size={14} /> {qz.totalPoints} pts
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5">
                    Pass {qz.passPercent}%
                  </span>
                </div>

                {/* Divider */}
                <div className="my-3 h-px w-full bg-gradient-to-r from-transparent via-gray-100 to-transparent" />

                {/* Footer hint */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="opacity-80">View details</span>
                  <span className="transition group-hover:translate-x-0.5">
                    <ChevronRight className="h-4 w-4" />
                  </span>
                </div>

                {/* Subtle edge glow */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-primary/30 via-transparent to-primary/30 opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            ))}
          </div>

          <Pagination
            page={data?.meta.page ?? 1}
            hasNext={Boolean(data?.meta.hasNextPage)}
            onPrev={() => set({ page: Math.max(1, page - 1) })}
            onNext={() => set({ page: page + 1 })}
          />
        </>
      )}
    </div>
  )
}

function Pagination({
  page,
  hasNext,
  onPrev,
  onNext,
}: {
  page: number
  hasNext: boolean
  onPrev: () => void
  onNext: () => void
}) {
  return (
    <div className="mt-6 flex items-center justify-center gap-3">
      <button
        onClick={onPrev}
        disabled={page <= 1}
        className="inline-flex items-center gap-1.5 rounded-xl border bg-white px-3 py-1.5 text-sm shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ChevronLeft className="h-4 w-4" />
        Prev
      </button>

      <div className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
        Page <span className="font-medium">{page}</span>
      </div>

      <button
        onClick={onNext}
        disabled={!hasNext}
        className="inline-flex items-center gap-1.5 rounded-xl border bg-white px-3 py-1.5 text-sm shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}
