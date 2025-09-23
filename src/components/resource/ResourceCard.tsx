// import { Link } from 'react-router-dom'
// import type { PublicResource } from '@/lib/resources.api'

// export default function ResourceCard({ r }: { r: PublicResource }) {
//   return (
//     <Link to={`/resources/${r.slug}`} className="card group overflow-hidden">
//       <div className="aspect-video w-full overflow-hidden rounded-md bg-gray-100">
//         {r.thumbnail ? (
//           <img
//             src={r.thumbnail}
//             alt={r.title}
//             className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
//           />
//         ) : null}
//       </div>
//       <div className="mt-3">
//         <div className="line-clamp-2 font-medium">{r.title}</div>
//         {r.category ? (
//           <div className="mt-0.5 text-xs text-gray-600">{r.category}</div>
//         ) : null}
//       </div>
//     </Link>
//   )
// }


import { Link } from 'react-router-dom'
import type { PublicResource } from '@/lib/resources.api'

export default function ResourceCard({ r }: { r: PublicResource }) {
  return (
    <Link
      to={`/resources/${r.slug}`}
      className="group block overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md hover:border-gray-300"
    >
      {/* Thumbnail */}
      <div className="aspect-video w-full overflow-hidden bg-gray-100">
        {r.thumbnail ? (
          <img
            src={r.thumbnail}
            alt={r.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
            No thumbnail
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4">
        <h3 className="line-clamp-2 text-sm font-semibold text-gray-900 group-hover:text-indigo-600">
          {r.title}
        </h3>

        {r.category && (
          <div className="mt-1 text-xs font-medium text-gray-500">
            {r.category}
          </div>
        )}
      </div>
    </Link>
  )
}
