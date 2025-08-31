import { Link } from 'react-router-dom'
import type { PublicLiveSession } from '@/lib/liveSessions.api'
import { prettyPrice } from '@/lib/liveSessions.api'
import LiveSessionBadges from './LiveSessionBadges'

export default function LiveSessionCard({ s }: { s: PublicLiveSession }) {
  const start = new Date(s.startAt)
  const end = new Date(s.endAt)

  return (
    <div className="group overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-md">
      <div className="aspect-[16/9] bg-gray-100">
        {s.thumbnail
          ? <img src={s.thumbnail} alt="" className="h-full w-full object-cover" />
          : <div className="h-full w-full grid place-items-center text-xs text-gray-500">No thumbnail</div>}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate font-semibold">{s.title}</div>
            <div className="mt-1 text-xs text-gray-600">
              {start.toLocaleDateString()} · {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="mt-2"><LiveSessionBadges pricing={s.pricing} membersAccess={s.membersAccess} /></div>
          </div>
          <div className="shrink-0 text-sm font-semibold text-primary">{prettyPrice(s.pricing)}</div>
        </div>

        <div className="mt-3 flex items-center justify-end">
          <Link to={`/live/${s.id}`} className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50">View</Link>
        </div>
      </div>
    </div>
  )
}
