import { Link } from 'react-router-dom'
import type { PublicResource } from '@/lib/resources.api'

export default function ResourceCard({ r }: { r: PublicResource }) {
  return (
    <Link to={`/resources/${r.slug}`} className="card group overflow-hidden">
      <div className="aspect-video w-full overflow-hidden rounded-md bg-gray-100">
        {r.thumbnail ? (
          <img
            src={r.thumbnail}
            alt={r.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
          />
        ) : null}
      </div>
      <div className="mt-3">
        <div className="line-clamp-2 font-medium">{r.title}</div>
        {r.category ? (
          <div className="mt-0.5 text-xs text-gray-600">{r.category}</div>
        ) : null}
      </div>
    </Link>
  )
}
