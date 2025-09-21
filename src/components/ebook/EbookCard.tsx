import { Link } from 'react-router-dom'
import type { PublicEbook } from '@/lib/ebooks.api'

export default function EbookCard({ e }: { e: PublicEbook }) {
  return (
    <Link to={`/ebooks/${e.slug}`} className="card group overflow-hidden">
      <div className="aspect-video w-full overflow-hidden rounded-md bg-gray-100">
        {e.thumbnail ? (
          <img
            src={e.thumbnail}
            alt={e.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
          />
        ) : null}
      </div>
      <div className="mt-3">
        <div className="line-clamp-2 font-medium">{e.title}</div>
        {e.category ? <div className="mt-0.5 text-xs text-gray-600">{e.category}</div> : null}
      </div>
    </Link>
  )
}
