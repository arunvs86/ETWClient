import { useQuery } from '@tanstack/react-query'
import { apiPublic } from '@/lib/api'
import type { ResourceListResponse } from '@/lib/resources.api'

function extractReelCode(url: string): string | null {
  const match = url.match(/instagram\.com\/reels?\/([A-Za-z0-9_-]+)/)
  return match ? match[1] : null
}

export default function ReelsList() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['reels'],
    queryFn: () => apiPublic.get<ResourceListResponse>('/resources', { params: { isReel: 'true', limit: 50 } }).then(r => r.data),
    staleTime: 60_000,
  })

  const reels = data?.items ?? []

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">Reels</h1>

      {isLoading && (
        <div className="text-sm text-gray-500">Loading reels…</div>
      )}

      {isError && (
        <div className="text-sm text-red-600">Failed to load reels.</div>
      )}

      {!isLoading && !isError && reels.length === 0 && (
        <div className="text-sm text-gray-500">No reels published yet.</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {reels.map((reel) => {
          const code = reel.reelUrl ? extractReelCode(reel.reelUrl) : null
          return (
            <div key={reel.id ?? reel._id} className="rounded-xl border bg-white shadow-sm overflow-hidden">
              {code ? (
                <iframe
                  src={`https://www.instagram.com/reel/${code}/embed`}
                  className="w-full"
                  style={{ height: 560, border: 'none' }}
                  allowFullScreen
                  scrolling="no"
                  title={reel.title}
                />
              ) : (
                <div className="flex items-center justify-center h-40 text-sm text-gray-400 bg-gray-50">
                  No reel URL set
                </div>
              )}
              {reel.title && (
                <div className="px-3 py-2 text-sm font-medium truncate">{reel.title}</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
