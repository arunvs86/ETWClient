import { useQuery } from '@tanstack/react-query'
import { listEbooks } from '@/lib/ebooks.api'
import EbookCard from '@/components/ebook/EbookCard'
import { useSearchState } from '@/hooks/useSearchState'

const DEFAULTS = { page: 1, limit: 12, sort: 'newest' }

export default function EbooksList() {
  const { state, update } = useSearchState<{ q?: string; category?: string; sort?: string; page: number; limit: number }>(DEFAULTS)

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ['ebooks', state],
    queryFn: () => listEbooks(state),
    placeholderData: (prev) => prev,
  })

  const items = data?.items || []
  const page = data?.meta.page || Number(state.page) || 1
  const hasNext = !!data?.meta.hasNextPage

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-2xl font-semibold">Ebooks</h2>
        <div className="relative w-full sm:w-80">
          <input
            className="w-full h-10 rounded-md border border-gray-300 px-3 pr-8"
            placeholder="Search ebooks…"
            value={String(state.q || '')}
            onChange={(e) => update({ q: e.target.value })}
          />
          {isFetching && (
            <div className="absolute right-2 top-2 h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
          )}
        </div>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="aspect-video rounded-lg bg-gray-200" />
              <div className="mt-3 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-2/3" />
                <div className="h-3 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {isError && <div className="text-red-600">Failed to load ebooks.</div>}

      {!isLoading && !isError && items.length === 0 && (
        <div className="text-gray-600">No ebooks match your filters.</div>
      )}

      {!isLoading && !isError && items.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((e) => (
              <EbookCard key={e.slug} e={{ ...e, id: (e as any).id ?? (e as any)._id }} />
            ))}
          </div>

          <div className="pt-4 flex items-center justify-center gap-2">
            <button
              onClick={() => update({ page: Math.max(1, Number(page) - 1) }, false)}
              disabled={page <= 1}
              className="rounded-md border px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              ← Prev
            </button>
            <div className="text-sm text-gray-600">Page {page}</div>
            <button
              onClick={() => update({ page: Number(page) + 1 }, false)}
              disabled={!hasNext}
              className="rounded-md border px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next →
            </button>
          </div>
        </>
      )}
    </div>
  )
}
