// import { useQuery } from '@tanstack/react-query'
// import { listResources } from '@/lib/resources.api'
// import ResourceCard from '@/components/resource/ResourceCard'
// import { useSearchState } from '@/hooks/useSearchState'

// const DEFAULTS = { page: 1, limit: 12, sort: 'newest' }

// export default function ResourcesList() {
//   const { state, update } = useSearchState<{
//     q?: string
//     category?: string
//     sort?: string
//     page: number
//     limit: number
//   }>(DEFAULTS)

//   const { data, isLoading, isError, isFetching } = useQuery({
//     queryKey: ['resources', state],
//     queryFn: () => listResources(state),
//     placeholderData: (prev) => prev,
//   })

//   const items = data?.items || []
//   const page = data?.meta.page || Number(state.page) || 1
//   const hasNext = !!data?.meta.hasNextPage

//   return (
//     <div className="space-y-4">
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
//         <h2 className="text-2xl font-semibold">Resources</h2>
//         <div className="relative w-full sm:w-80">
//           <input
//             className="w-full h-10 rounded-md border border-gray-300 px-3 pr-8"
//             placeholder="Search resources…"
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

//       {isError && <div className="text-red-600">Failed to load resources.</div>}

//       {!isLoading && !isError && items.length === 0 && (
//         <div className="text-gray-600">No resources match your filters.</div>
//       )}

//       {!isLoading && !isError && items.length > 0 && (
//         <>
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//             {items.map((r) => (
//               <ResourceCard key={r.slug} r={{ ...r, id: (r as any).id ?? (r as any)._id }} />
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
import { listResources } from '@/lib/resources.api'
import ResourceCard from '@/components/resource/ResourceCard'
import { useSearchState } from '@/hooks/useSearchState'
import PurchasedRail from '@/components/purchases/PurchasedRail';

const DEFAULTS = { page: 1, limit: 12, sort: 'newest' }

export default function ResourcesList() {
  const { state, update } = useSearchState<{
    q?: string
    category?: string
    sort?: string
    page: number
    limit: number
  }>(DEFAULTS)

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ['resources', state],
    queryFn: () => listResources(state),
    placeholderData: (prev) => prev,
  })

  const items = data?.items || []
  const page = data?.meta.page || Number(state.page) || 1
  const hasNext = !!data?.meta.hasNextPage

  return (
    <div className="space-y-5">
      {/* Header */}
      <aside className="h-fit space-y-4">
  <PurchasedRail title="My Resources" kinds="resource" />
</aside>
      <div className="rounded-2xl border bg-gradient-to-r from-indigo-50 to-violet-50 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Resources</h2>
            <p className="text-xs sm:text-sm text-gray-600">Browse all downloadable packs and links.</p>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-80">
            <input
              className="w-full h-10 rounded-lg border border-gray-300 bg-white pl-10 pr-9 shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition"
              placeholder="Search resources…"
              value={String(state.q || '')}
              onChange={(e) => update({ q: e.target.value })}
            />
            {/* Icon */}
            <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-3.5-3.5" />
            </svg>
            {/* Spinner */}
            {isFetching && (
              <div className="absolute right-2 top-2 h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
            )}
            {/* Clear button (UI only; no new functionality) */}
            {state.q && !isFetching && (
              <button
                type="button"
                onClick={() => update({ q: '' })}
                className="absolute right-2 top-1/2 -translate-y-1/2 grid place-items-center h-6 w-6 rounded-full hover:bg-gray-100"
                aria-label="Clear search"
                title="Clear"
              >
                <svg className="h-4 w-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-white p-4 shadow-sm">
              <div className="aspect-video rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
              <div className="mt-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
                <div className="h-3 bg-gray-200 rounded w-1/3 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Failed to load resources. Please try again.
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && items.length === 0 && (
        <div className="rounded-2xl border bg-white p-8 sm:p-12 text-center">
          <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-indigo-50 grid place-items-center">
            <svg className="h-7 w-7 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 7h18M3 12h18M3 17h18" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold">No resources found</h3>
          <p className="mt-1 text-sm text-gray-600">Try adjusting your search.</p>
        </div>
      )}

      {/* Grid */}
      {!isLoading && !isError && items.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((r) => (
              <div key={r.slug} className="group rounded-xl border bg-white shadow-sm transition hover:shadow-md">
                <ResourceCard r={{ ...r, id: (r as any).id ?? (r as any)._id }} />
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="pt-4 flex items-center justify-center gap-2">
            <button
              onClick={() => update({ page: Math.max(1, Number(page) - 1) }, false)}
              disabled={page <= 1}
              className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm bg-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60 hover:bg-gray-50"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
              Prev
            </button>
            <div className="rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-700">Page {page}</div>
            <button
              onClick={() => update({ page: Number(page) + 1 }, false)}
              disabled={!hasNext}
              className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm bg-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60 hover:bg-gray-50"
            >
              Next
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
        </>
      )}
    </div>
  )
}
