// import { useQuery } from '@tanstack/react-query'
// import { listEbooks } from '@/lib/ebooks.api'
// import EbookCard from '@/components/ebook/EbookCard'
// import { useSearchState } from '@/hooks/useSearchState'

// const DEFAULTS = { page: 1, limit: 12, sort: 'newest' }

// export default function EbooksList() {
//   const { state, update } = useSearchState<{ q?: string; category?: string; sort?: string; page: number; limit: number }>(DEFAULTS)

//   const { data, isLoading, isError, isFetching } = useQuery({
//     queryKey: ['ebooks', state],
//     queryFn: () => listEbooks(state),
//     placeholderData: (prev) => prev,
//   })

//   const items = data?.items || []
//   const page = data?.meta.page || Number(state.page) || 1
//   const hasNext = !!data?.meta.hasNextPage

//   return (
//     <div className="space-y-4">
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
//         <h2 className="text-2xl font-semibold">Ebooks</h2>
//         <div className="relative w-full sm:w-80">
//           <input
//             className="w-full h-10 rounded-md border border-gray-300 px-3 pr-8"
//             placeholder="Search ebooks…"
//             value={String(state.q || '')}
//             onChange={(e) => update({ q: e.target.value })}
//           />
//           {isFetching && (
//             <div className="absolute right-2 top-2 h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
//           )}
//         </div>
//       </div>

//       {isLoading && (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//           {Array.from({ length: 6 }).map((_, i) => (
//             <div key={i} className="card p-4 animate-pulse">
//               <div className="aspect-video rounded-lg bg-gray-200" />
//               <div className="mt-3 space-y-2">
//                 <div className="h-4 bg-gray-200 rounded w-2/3" />
//                 <div className="h-3 bg-gray-200 rounded w-1/3" />
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {isError && <div className="text-red-600">Failed to load ebooks.</div>}

//       {!isLoading && !isError && items.length === 0 && (
//         <div className="text-gray-600">No ebooks match your filters.</div>
//       )}

//       {!isLoading && !isError && items.length > 0 && (
//         <>
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//             {items.map((e) => (
//               <EbookCard key={e.slug} e={{ ...e, id: (e as any).id ?? (e as any)._id }} />
//             ))}
//           </div>

//           <div className="pt-4 flex items-center justify-center gap-2">
//             <button
//               onClick={() => update({ page: Math.max(1, Number(page) - 1) }, false)}
//               disabled={page <= 1}
//               className="rounded-md border px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
//             >
//               ← Prev
//             </button>
//             <div className="text-sm text-gray-600">Page {page}</div>
//             <button
//               onClick={() => update({ page: Number(page) + 1 }, false)}
//               disabled={!hasNext}
//               className="rounded-md border px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
//             >
//               Next →
//             </button>
//           </div>
//         </>
//       )}
//     </div>
//   )
// }

import { useQuery } from '@tanstack/react-query'
import { listEbooks } from '@/lib/ebooks.api'
import EbookCard from '@/components/ebook/EbookCard'
import { useSearchState } from '@/hooks/useSearchState'
import {
  Search,
  Loader2,
  HelpCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  BookOpen
} from 'lucide-react'
import PurchasedRail from '@/components/purchases/PurchasedRail';


const DEFAULTS = { page: 1, limit: 12, sort: 'newest' }

export default function EbooksList() {
  const { state, update } = useSearchState<{ q?: string; category?: string; sort?: string; page: number; limit: number }>(DEFAULTS)

  const { data, isLoading, isError, isFetching, refetch, error } = useQuery({
    queryKey: ['ebooks', state],
    queryFn: () => listEbooks(state),
    placeholderData: (prev) => prev,
    staleTime: 10_000,
    keepPreviousData: true,
  })

  const items = data?.items || []
  const page = data?.meta?.page || Number(state.page) || 1
  const hasNext = !!data?.meta?.hasNextPage

  return (
    <div className="space-y-6">
      <aside className="h-fit space-y-4">
  <PurchasedRail title="My Ebooks" kinds="ebook" />
</aside>
      {/* Header / Search */}
      <div className="rounded-2xl border bg-gradient-to-br from-white to-gray-50 p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10">
                <BookOpen className="h-4 w-4 text-primary" />
              </span>
              Ebooks
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Browse and discover reading material for your courses.
            </p>
          </div>

          <div className="relative w-full sm:w-[28rem]">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              className="h-10 w-full rounded-full border border-gray-300 bg-white/90 pl-10 pr-24 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20"
              placeholder="Search ebooks…"
              value={String(state.q || '')}
              onChange={(e) => update({ q: e.target.value })}
            />
            <div className="absolute right-2 top-2">
              {isFetching ? (
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              ) : (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">Ready</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="relative overflow-hidden rounded-2xl border bg-white shadow-sm">
              <div className="aspect-video" />
              <div className="p-4">
                <div className="h-4 w-2/3 rounded bg-gray-200" />
                <div className="mt-2 h-3 w-1/3 rounded bg-gray-200" />
              </div>
              <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <div className="font-medium">Failed to load ebooks</div>
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
      )}

      {/* Empty */}
      {!isLoading && !isError && items.length === 0 && (
        <div className="rounded-2xl border bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-gray-100">
            <HelpCircle className="h-6 w-6 text-gray-500" />
          </div>
          <div className="font-medium">No ebooks match your filters</div>
          <p className="mt-1 text-sm text-gray-600">Try a different keyword or clear the search.</p>
          {state.q ? (
            <button
              onClick={() => update({ q: '' })}
              className="mt-3 rounded-lg border bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
            >
              Clear search
            </button>
          ) : null}
        </div>
      )}

      {/* Grid */}
      {!isLoading && !isError && items.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((e) => (
              <EbookCard
                key={e.slug}
                e={{ ...e, id: (e as any).id ?? (e as any)._id }}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="pt-4 flex items-center justify-center gap-3">
            <button
              onClick={() => update({ page: Math.max(1, Number(page) - 1) }, false)}
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
              onClick={() => update({ page: Number(page) + 1 }, false)}
              disabled={!hasNext}
              className="inline-flex items-center gap-1.5 rounded-xl border bg-white px-3 py-1.5 text-sm shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </>
      )}
    </div>
  )
}
