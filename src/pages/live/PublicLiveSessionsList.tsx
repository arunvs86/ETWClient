import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { listLiveSessions } from '@/lib/liveSessions.api'
import LiveSessionCard from '@/components/live/LiveSessionCard'

export default function PublicLiveSessionsList() {
  const [page, setPage] = useState(1)
  const [onlyUpcoming, setOnlyUpcoming] = useState(true)
  const [showFree, setShowFree] = useState<'all'|'free'|'paid'>('all')

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['liveSessions', { page, onlyUpcoming }],
    queryFn: () => listLiveSessions({
      page,
      limit: 12,
      status: onlyUpcoming ? 'scheduled' : undefined,
      visibility: 'public',
    }),
    keepPreviousData: true,
    staleTime: 15_000,
  })

  const items = (data?.results || []).filter(s => {
    if (showFree === 'all') return true
    if (showFree === 'free') return s.pricing?.type === 'free'
    return s.pricing?.type === 'paid'
  })

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rounded-2xl border bg-gradient-to-r from-indigo-50 to-violet-50 p-5 md:p-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold">Live Sessions</h1>
            <p className="text-gray-700 text-sm">Attend upcoming workshops and Q&As.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              className={`rounded-md border px-3 py-1.5 text-sm ${onlyUpcoming ? 'bg-gray-900 text-white' : 'bg-white hover:bg-gray-50'}`}
              onClick={()=>setOnlyUpcoming(!onlyUpcoming)}
            >
              {onlyUpcoming ? 'Showing Upcoming' : 'Showing All'}
            </button>
            <div className="inline-flex overflow-hidden rounded-md border">
              {(['all','free','paid'] as const).map(k => (
                <button
                  key={k}
                  onClick={()=>setShowFree(k)}
                  className={`px-3 py-1.5 text-sm ${showFree===k ? 'bg-gray-900 text-white' : 'bg-white hover:bg-gray-50'} ${k!=='paid' ? 'border-r' : ''}`}
                >
                  {k[0].toUpperCase()+k.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-56 rounded-xl border bg-white">
              <div className="h-32 bg-gray-100 rounded-t-xl animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-2/3 rounded bg-gray-100 animate-pulse" />
                <div className="h-3 w-1/3 rounded bg-gray-100 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          Failed to load live sessions. <button className="underline ml-1" onClick={()=>refetch()}>Retry</button>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border p-8 text-center text-gray-600">No sessions.</div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map(s => <LiveSessionCard key={s.id} s={s} />)}
          </div>

          {/* Pager */}
          <div className="pt-4 flex items-center justify-center gap-2">
            <button
              onClick={()=>setPage(p=>Math.max(1, p-1))}
              disabled={page<=1}
              className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >← Prev</button>
            <div className="text-sm text-gray-600">Page {page}{isFetching ? '…' : ''}</div>
            <button
              onClick={()=>setPage(p=>p+1)}
              disabled={Boolean(data && (data.page*data.pageSize >= data.total))}
              className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >Next →</button>
          </div>
        </>
      )}
    </div>
  )
}
