import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { getEbookBySlug, createEbookCheckout, confirmEbookPurchase, type PublicEbookItem } from '@/lib/ebooks.api'
import Button from '@/components/ui/Button'

function formatPrice(amountMinor?: number, currency: 'GBP'|'USD'|'EUR' = 'GBP', isFree?: boolean) {
  if (isFree || !amountMinor) return 'Free'
  const amount = (amountMinor || 0) / 100
  try { return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount) }
  catch { return `${amount.toFixed(2)} ${currency}` }
}

export default function EbookPublic() {
  const { slug = '' } = useParams()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['ebook', slug],
    queryFn: () => getEbookBySlug(slug),
    enabled: !!slug,
  })

  // Handle Stripe redirect confirm → refresh
  useEffect(() => {
    const sp = new URLSearchParams(location.search)
    const ok = sp.get('purchase') === 'success'
    const sid = sp.get('session_id')
    if (ok && sid) {
      confirmEbookPurchase(sid).finally(() => {
        const url = new URL(location.href)
        url.searchParams.delete('purchase')
        url.searchParams.delete('session_id')
        window.history.replaceState({}, '', url.toString())
        refetch()
      })
    }
  }, [refetch])

  const mCheckout = useMutation({
    mutationFn: async (ebookId: string) => {
      const { checkoutUrl } = await createEbookCheckout(ebookId)
      window.location.href = checkoutUrl
      return null
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-2/3 bg-gray-200 rounded" />
        <div className="h-4 w-1/3 bg-gray-200 rounded" />
        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-4">
            <div className="aspect-video max-h-56 rounded-md bg-gray-200" />
            <div className="h-28 rounded-md bg-gray-200" />
          </div>
          <div className="h-44 rounded-md bg-gray-200" />
        </div>
      </div>
    )
  }

  if (isError || !data) return <div className="text-red-600">Ebook not found.</div>

  const { ebook, items } = data
  const isFree = (ebook.pricing?.amountMinor ?? 0) === 0
  const showItems = ebook.unlocked || isFree
  const priceLabel = formatPrice(ebook.pricing?.amountMinor, ebook.pricing?.currency || 'GBP', ebook.pricing?.isFree)

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
      {/* Main */}
      <div className="space-y-4">
        {/* Title + meta */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{ebook.title}</h1>
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
            {ebook.category && (
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 font-medium text-gray-700">
                {ebook.category}
              </span>
            )}
            {!showItems && (
              <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-800">
                Locked
              </span>
            )}
            {showItems && !isFree && (
              <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 font-medium text-green-800">
                You own this
              </span>
            )}
          </div>
        </div>

        {/* Thumbnail (capped height) */}
        {ebook.thumbnail && (
          <div className="aspect-video max-h-56 w-full overflow-hidden rounded-md bg-gray-100">
            <img
              src={ebook.thumbnail}
              alt={ebook.title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        {/* Overview */}
        {ebook.description && (
          <div className="rounded-md border bg-white p-4 sm:p-5">
            <h3 className="mb-2 text-sm font-semibold text-gray-900">Overview</h3>
            <p className="text-sm leading-6 text-gray-800 whitespace-pre-line">{ebook.description}</p>
          </div>
        )}

        {/* Contents */}
        <div className="rounded-md border bg-white p-4 sm:p-5">
          {/* <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Contents</h3>
            <span className="text-xs text-gray-500">{items.length} item{items.length === 1 ? '' : 's'}</span>
          </div> */}

          {showItems ? (
            items.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {items.map((it: PublicEbookItem) => (
                  <li key={it.id} className="flex items-center justify-between gap-3 py-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-gray-900">{it.title}</div>
                      <div className="truncate text-[12px] text-gray-600">
                        {it.type === 'link'
                          ? `🔗 ${it.link?.url}`
                          : `📄 ${it.file?.fileName || it.file?.url}`}
                      </div>
                    </div>

                    {it.type === 'link' ? (
                      <a href={it.link?.url} target="_blank" rel="noreferrer" className="shrink-0">
                        <Button size="sm">Open</Button>
                      </a>
                    ) : (
                      <a href={it.file?.url} target="_blank" rel="noreferrer" className="shrink-0" download>
                        <Button size="sm">Download</Button>
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-gray-600">No files added yet.</div>
            )
          ) : (
            <div className="text-sm text-gray-700">
              Purchase to unlock the ebook.
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <aside className="lg:sticky lg:top-24 h-fit">
        <div className="rounded-md border bg-white p-4 sm:p-5 space-y-3">
          <div className="flex items-baseline justify-between">
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{priceLabel}</div>
            {ebook.pricing?.includedInMembership && (
              <span className="text-[11px] font-medium text-green-700">In membership</span>
            )}
          </div>

          {!showItems && (
            <Button
              full
              onClick={() => mCheckout.mutate(String(ebook.id || (ebook as any)._id))}
              disabled={mCheckout.isPending}
            >
              {mCheckout.isPending ? 'Redirecting…' : 'Buy ebook'}
            </Button>
          )}

          {showItems && !isFree && (
            <div className="rounded border border-green-200 bg-green-50 p-2 text-[12px] text-green-800">
              You own this ebook.
            </div>
          )}

          {/* Small preview thumb on mobile-only (sidebar), hidden if already shown above */}
          {ebook.thumbnail && (
            <div className="mt-2 block lg:hidden">
              <div className="aspect-video max-h-40 w-full overflow-hidden rounded-md bg-gray-100">
                <img src={ebook.thumbnail} alt={ebook.title} className="h-full w-full object-cover" loading="lazy" />
              </div>
            </div>
          )}

          {/* Meta */}
          <div className="pt-1 text-xs text-gray-600">
            {ebook.category && <div>Category: <b className="text-gray-800">{ebook.category}</b></div>}
            {ebook.publishedAt && (
              <div>Published: {new Date(ebook.publishedAt).toLocaleDateString()}</div>
            )}
          </div>
        </div>
      </aside>
    </div>
  )
}
