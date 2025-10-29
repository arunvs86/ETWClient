// // src/pages/instructor/live/MyLiveSessionsPage.tsx
// import { useEffect, useMemo, useState } from 'react'
// import { Link } from 'react-router-dom'
// import { useQuery } from '@tanstack/react-query'
// import { listLiveSessions, type PublicLiveSession } from '@/lib/liveSessions.api'
// import LiveSessionBadges from '@/components/live/LiveSessionBadges'
// import { useAuth } from '@/context/AuthProvider'
// import { prettyPrice } from '@/lib/liveSessions.api'

// export default function MyLiveSessionsPage() {
//   const { user, loading } = useAuth()
//   const [page, setPage] = useState(1)

//   const { data, isLoading, isError, isFetching, refetch } = useQuery({
//     queryKey: ['myLiveSessions', { page }],
//     // we reuse public endpoint; client-filter by host
//     queryFn: () => listLiveSessions({ page, limit: 20, visibility: 'public' }),
//     enabled: !loading && !!user,
//     keepPreviousData: true,
//     staleTime: 10_000,
//   })

//   const items: PublicLiveSession[] = useMemo(() => {
//     const all = data?.results || []
//     if (!user) return []
//     // Filter to my sessions
//     return all.filter(s => (s.hostUserId === (user.id || user._id)))
//   }, [data, user])

//   return (
//     <div className="mx-auto max-w-6xl p-4 sm:p-6 space-y-4">
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
//         <h1 className="text-2xl font-semibold">My Live Sessions</h1>
//         <Link to="/instructor/live/new" className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-white hover:opacity-95">
//           + New live session
//         </Link>
//       </div>

//       {isLoading ? (
//         <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
//           {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-28 rounded-md bg-gray-100 animate-pulse" />)}
//         </div>
//       ) : isError ? (
//         <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
//           Failed to load sessions. <button className="underline ml-2" onClick={()=>refetch()}>Retry</button>
//         </div>
//       ) : items.length === 0 ? (
//         <div className="rounded-md border p-8 text-center text-gray-600">
//           You have no sessions yet. Create your first one.
//         </div>
//       ) : (
//         <>
//           <div className="hidden md:block overflow-hidden rounded-md border border-gray-200">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Title</th>
//                   <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Schedule</th>
//                   <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Badges</th>
//                   <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Price</th>
//                   <th className="px-4 py-3" />
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-100 bg-white">
//                 {items.map((s) => (
//                   <tr key={s.id} className="hover:bg-gray-50">
//                     <td className="px-4 py-3">
//                       <div className="font-medium">{s.title}</div>
//                     </td>
//                     <td className="px-4 py-3 text-sm text-gray-600">
//                       {new Date(s.startAt).toLocaleString()} – {new Date(s.endAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                     </td>
//                     <td className="px-4 py-3 text-sm"><LiveSessionBadges pricing={s.pricing} membersAccess={s.membersAccess} /></td>
//                     <td className="px-4 py-3 text-sm">{prettyPrice(s.pricing)}</td>
//                     <td className="px-4 py-3 text-right">
//                       <Link to={`/live/${s.id}`} className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50">Open</Link>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {/* Mobile cards */}
//           <div className="grid grid-cols-1 gap-3 md:hidden">
//             {items.map((s) => (
//               <div key={s.id} className="flex items-center justify-between rounded-md border border-gray-200 bg-white p-3">
//                 <div>
//                   <div className="font-medium">{s.title}</div>
//                   <div className="text-xs text-gray-600">{new Date(s.startAt).toLocaleString()}</div>
//                 </div>
//                 <Link to={`/live/${s.id}`} className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50">Open</Link>
//               </div>
//             ))}
//           </div>

//           <div className="pt-2 flex items-center justify-center gap-2">
//             <button
//               onClick={()=>setPage(p=>Math.max(1, p-1))}
//               disabled={page<=1}
//               className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed">← Prev</button>
//             <div className="text-sm text-gray-600">Page {page}{isFetching ? '…' : ''}</div>
//             <button
//               onClick={()=>setPage(p=>p+1)}
//               disabled={Boolean(data && (data.page*data.pageSize >= data.total))}
//               className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed">Next →</button>
//           </div>
//         </>
//       )}
//     </div>
//   )
// }

// src/pages/instructor/live/MyLiveSessionsPage.tsx
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  listLiveSessions,
  type PublicLiveSession,
  prettyPrice,
  deleteLiveSession,
} from '@/lib/liveSessions.api'
import LiveSessionBadges from '@/components/live/LiveSessionBadges'
import { useAuth } from '@/context/AuthProvider'

export default function MyLiveSessionsPage() {
  const { user, loading } = useAuth()
  const [page, setPage] = useState(1)
  const nav = useNavigate()
  const queryClient = useQueryClient()

  const {
    data,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['myLiveSessions', { page }],
    // NOTE: we reuse the public list and then filter
    queryFn: () => listLiveSessions({ page, limit: 20, visibility: 'public' }),
    enabled: !loading && !!user,
    keepPreviousData: true,
    staleTime: 10_000,
  })

  const items: PublicLiveSession[] = useMemo(() => {
    const all = data?.results || []
    if (!user) return []
    return all.filter((s) => s.hostUserId === (user.id || (user as any)._id))
  }, [data, user])

  async function handleDelete(sessionId: string) {
    const yes = window.confirm(
      'Are you sure you want to delete this live session? This cannot be undone.'
    )
    if (!yes) return

    try {
      const res = await deleteLiveSession(sessionId)
      if (!res?.ok) {
        alert(res?.error || 'Failed to delete')
        return
      }

      // Optimistic-ish refresh:
      // 1. invalidate our query so it reloads
      queryClient.invalidateQueries({ queryKey: ['myLiveSessions'] })
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Failed to delete')
    }
  }

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 space-y-4">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-semibold">My Live Sessions</h1>

        <Link
          to="/instructor/live/new"
          className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-white hover:opacity-95"
        >
          + New live session
        </Link>
      </div>

      {/* Main body states */}
      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-md bg-gray-100 animate-pulse"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
          Failed to load sessions.
          <button
            className="underline ml-2"
            onClick={() => refetch()}
          >
            Retry
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-md border p-8 text-center text-gray-600">
          You have no sessions yet. Create your first one.
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block overflow-hidden rounded-md border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Schedule
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Badges
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Price
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 bg-white">
                {items.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-gray-50 align-top"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-sm text-gray-900">
                        {s.title}
                      </div>
                      <div className="mt-0.5 text-[11px] text-gray-500">
                        ID: {s.id}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      <div>
                        {new Date(s.startAt).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        →
                        {` ${new Date(s.endAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}`}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-sm">
                      <LiveSessionBadges
                        pricing={s.pricing}
                        membersAccess={s.membersAccess}
                      />
                    </td>

                    <td className="px-4 py-3 text-sm">
                      {prettyPrice(s.pricing)}
                    </td>

                    <td className="px-4 py-3 text-right text-sm">
                      <div className="inline-flex flex-col gap-2 items-end">
                        <Link
                          to={`/live/${s.id}`}
                          className="rounded-md border px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Open
                        </Link>

                        <button
                          onClick={() => nav(`/live/${s.id}/edit`)}
                          className="rounded-md border px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(s.id)}
                          className="rounded-md border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {items.map((s) => (
              <div
                key={s.id}
                className="rounded-md border border-gray-200 bg-white p-3"
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0 pr-2">
                    <div className="font-medium text-sm text-gray-900">
                      {s.title}
                    </div>
                    <div className="text-[11px] text-gray-500 break-all">
                      {new Date(s.startAt).toLocaleString()}
                    </div>
                    <div className="mt-1 text-xs">
                      <LiveSessionBadges
                        pricing={s.pricing}
                        membersAccess={s.membersAccess}
                      />
                    </div>
                    <div className="mt-1 text-xs text-gray-600">
                      {prettyPrice(s.pricing)}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 text-right shrink-0">
                    <Link
                      to={`/live/${s.id}`}
                      className="rounded-md border px-2 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Open
                    </Link>

                    <button
                      onClick={() => nav(`/live/${s.id}/edit`)}
                      className="rounded-md border px-2 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(s.id)}
                      className="rounded-md border border-red-300 bg-red-50 px-2 py-1 text-[11px] font-medium text-red-700 hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="pt-2 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Prev
            </button>

            <div className="text-sm text-gray-600">
              Page {page}
              {isFetching ? '…' : ''}
            </div>

            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={Boolean(
                data && data.page * data.pageSize >= data.total
              )}
              className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        </>
      )}
    </div>
  )
}
