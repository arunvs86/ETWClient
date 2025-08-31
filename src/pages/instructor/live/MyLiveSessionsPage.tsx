// src/pages/instructor/live/MyLiveSessionsPage.tsx
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { listLiveSessions, type PublicLiveSession } from '@/lib/liveSessions.api'
import LiveSessionBadges from '@/components/live/LiveSessionBadges'
import { useAuth } from '@/context/AuthProvider'
import { prettyPrice } from '@/lib/liveSessions.api'

export default function MyLiveSessionsPage() {
  const { user, loading } = useAuth()
  const [page, setPage] = useState(1)

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ['myLiveSessions', { page }],
    // we reuse public endpoint; client-filter by host
    queryFn: () => listLiveSessions({ page, limit: 20, visibility: 'public' }),
    enabled: !loading && !!user,
    keepPreviousData: true,
    staleTime: 10_000,
  })

  const items: PublicLiveSession[] = useMemo(() => {
    const all = data?.results || []
    if (!user) return []
    // Filter to my sessions
    return all.filter(s => (s.hostUserId === (user.id || user._id)))
  }, [data, user])

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-semibold">My Live Sessions</h1>
        <Link to="/instructor/live/new" className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-white hover:opacity-95">
          + New live session
        </Link>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-28 rounded-md bg-gray-100 animate-pulse" />)}
        </div>
      ) : isError ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
          Failed to load sessions. <button className="underline ml-2" onClick={()=>refetch()}>Retry</button>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-md border p-8 text-center text-gray-600">
          You have no sessions yet. Create your first one.
        </div>
      ) : (
        <>
          <div className="hidden md:block overflow-hidden rounded-md border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Schedule</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Badges</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Price</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {items.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium">{s.title}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(s.startAt).toLocaleString()} – {new Date(s.endAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3 text-sm"><LiveSessionBadges pricing={s.pricing} membersAccess={s.membersAccess} /></td>
                    <td className="px-4 py-3 text-sm">{prettyPrice(s.pricing)}</td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/live/${s.id}`} className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50">Open</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {items.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-md border border-gray-200 bg-white p-3">
                <div>
                  <div className="font-medium">{s.title}</div>
                  <div className="text-xs text-gray-600">{new Date(s.startAt).toLocaleString()}</div>
                </div>
                <Link to={`/live/${s.id}`} className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50">Open</Link>
              </div>
            ))}
          </div>

          <div className="pt-2 flex items-center justify-center gap-2">
            <button
              onClick={()=>setPage(p=>Math.max(1, p-1))}
              disabled={page<=1}
              className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed">← Prev</button>
            <div className="text-sm text-gray-600">Page {page}{isFetching ? '…' : ''}</div>
            <button
              onClick={()=>setPage(p=>p+1)}
              disabled={Boolean(data && (data.page*data.pageSize >= data.total))}
              className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed">Next →</button>
          </div>
        </>
      )}
    </div>
  )
}
