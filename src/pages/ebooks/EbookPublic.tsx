import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { getEbookBySlug, createEbookCheckout, confirmEbookPurchase, type PublicEbookItem } from '@/lib/ebooks.api'
import Button from '@/components/ui/Button'

import {
  Tag,
  Lock,
  Unlock,
  Calendar as CalendarIcon,
  Link as LinkIcon,
  FileText,
  ExternalLink,
  ShieldCheck,
  ShoppingCart,
  Download,
  ChevronRight,
  Image as ImageIcon,
  Shield,
  CheckCircle2,
  Loader2,
} from 'lucide-react'

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
      <div className="space-y-5">
        <div className="h-9 w-3/4 animate-pulse rounded-xl bg-gray-200" />
        <div className="h-4 w-1/3 animate-pulse rounded-lg bg-gray-200" />
        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-4">
            <div className="aspect-video max-h-56 w-full overflow-hidden rounded-xl bg-gray-100">
              <div className="h-full w-full animate-pulse bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100" />
            </div>
            <div className="h-28 animate-pulse rounded-xl bg-gray-100" />
          </div>
          <div className="h-48 animate-pulse rounded-xl bg-gray-100" />
        </div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
        Ebook not found.
      </div>
    )
  }

  const { ebook, items } = data
  const isFree = (ebook.pricing?.amountMinor ?? 0) === 0
  const showItems = ebook.unlocked || isFree
  const priceLabel = formatPrice(ebook.pricing?.amountMinor, ebook.pricing?.currency || 'GBP', ebook.pricing?.isFree)

  return (
    
    <div className="space-y-5">
      
      {/* Soft header band */}
      <div className="rounded-2xl border bg-gradient-to-br from-white to-gray-50 p-5 shadow-sm">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">{ebook.title}</h1>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {ebook.category && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 font-medium text-gray-700">
                <Tag className="h-3.5 w-3.5" /> {ebook.category}
              </span>
            )}
            {!showItems ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-800">
                <Lock className="h-3.5 w-3.5" /> Locked
              </span>
            ) : !isFree ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 font-medium text-green-800">
                <ShieldCheck className="h-3.5 w-3.5" /> You own this
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700">
                <Unlock className="h-3.5 w-3.5" /> Free
              </span>
            )}
            {ebook.publishedAt && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 font-medium text-gray-700">
                <CalendarIcon className="h-3.5 w-3.5" />
                {new Date(ebook.publishedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        {/* Main */}
        <div className="space-y-4">
          {/* Thumbnail */}
          {ebook.thumbnail ? (
            <div className="relative aspect-video max-h-56 w-full overflow-hidden rounded-xl border bg-gray-50">
              <img
                src={ebook.thumbnail}
                alt={ebook.title}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="grid aspect-video max-h-56 w-full place-items-center rounded-xl border bg-gray-50 text-gray-400">
              <ImageIcon className="h-8 w-8" />
            </div>
          )}

          {/* Overview */}
          {ebook.description && (
            <div className="rounded-2xl border bg-white p-4 sm:p-5 shadow-sm">
              <h3 className="mb-2 text-sm font-semibold text-gray-900">Overview</h3>
              <p className="whitespace-pre-line text-sm leading-6 text-gray-800">{ebook.description}</p>
            </div>
          )}

          {/* Contents */}
          <div className="rounded-2xl border bg-white p-4 sm:p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Contents</h3>
              <span className="text-xs text-gray-500">
                {items.length} item{items.length === 1 ? '' : 's'}
              </span>
            </div>

            {showItems ? (
              items.length > 0 ? (
                <ul className="divide-y divide-gray-100">
                  {items.map((it: PublicEbookItem) => {
                    const isLink = it.type === 'link'
                    const href = isLink ? it.link?.url : it.file?.url
                    const secondary = isLink ? it.link?.url : (it.file?.fileName || it.file?.url)
                    return (
                      <li key={it.id} className="group flex items-center justify-between gap-3 py-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-gray-100">
                              {isLink ? <LinkIcon className="h-4 w-4 text-gray-600" /> : <FileText className="h-4 w-4 text-gray-600" />}
                            </span>
                            <div className="min-w-0">
                              <div className="truncate text-sm font-medium text-gray-900">{it.title}</div>
                              <div className="truncate text-[12px] text-gray-600">
                                {isLink ? `Link: ${secondary}` : `File: ${secondary}`}
                              </div>
                            </div>
                          </div>
                        </div>

                        {href ? (
                          isLink ? (
                            <a
                              href={href}
                              target="_blank"
                              rel="noreferrer"
                              className="shrink-0 inline-flex items-center gap-1 text-sm text-primary hover:underline"
                            >
                              Open <ExternalLink className="h-4 w-4" />
                            </a>
                          ) : (
                            <a
                              href={href}
                              target="_blank"
                              rel="noreferrer"
                              download
                              className="shrink-0 inline-flex items-center gap-1 text-sm text-primary hover:underline"
                            >
                              Download <Download className="h-4 w-4" />
                            </a>
                          )
                        ) : null}

                        <ChevronRight className="ml-1 hidden h-4 w-4 text-gray-300 transition group-hover:text-gray-400 sm:block" />
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <div className="rounded-lg border border-dashed border-gray-200 p-4 text-center text-sm text-gray-600">
                  No files added yet.
                </div>
              )
            ) : (
              <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                <Lock className="h-4 w-4" /> Purchase to unlock the ebook.
              </div>
            )}
          </div>
        </div>

        {/* Sidebar (Richer Pricing + CTA) */}
        <aside className="h-fit lg:sticky lg:top-24">
          <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
            {/* Price header with gradient */}
            <div className="relative border-b bg-gradient-to-r from-primary/10 via-transparent to-primary/10 p-4">
              {ebook.pricing?.includedInMembership && (
                <div className="absolute right-3 top-3 rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-700">
                  Included in membership
                </div>
              )}
              <div className="flex items-end gap-2">
                <div className="text-2xl font-bold text-gray-900">{priceLabel}</div>
                {!isFree && <span className="mb-0.5 text-xs text-gray-500">one-time</span>}
              </div>
              {/* {!showItems && !isFree && (
                <div className="mt-1 text-xs text-gray-600">
                  Instant access to <b>{items.length}</b> item{items.length === 1 ? '' : 's'}.
                </div>
              )} */}
            </div>

            {/* Benefits / trust */}
            {!showItems && (
              <ul className="px-4 pt-3 space-y-2 text-sm">
                <li className="flex items-center gap-2 text-gray-700">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  High-quality downloads & links
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Lifetime access to purchased files
                </li>
                {ebook.pricing?.includedInMembership && (
                  <li className="flex items-center gap-2 text-gray-700">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Free for members
                  </li>
                )}
              </ul>
            )}

            {/* CTA */}
            <div className="p-4">
              {!showItems ? (
                <button
                  onClick={() => mCheckout.mutate(String(ebook.id || (ebook as any)._id))}
                  disabled={mCheckout.isPending}
                  className="
                    group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden
                    rounded-xl bg-primary px-4 py-2.5 text-white shadow-sm transition
                    hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70
                  "
                >
                  {/* glossy shine */}
                  <span
                    className="
                      pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-white/0 via-white/30 to-white/0
                      transition-transform duration-700 group-hover:translate-x-full
                    "
                  />
                  {mCheckout.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Redirecting…
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4" />
                      Buy ebook
                    </>
                  )}
                </button>
              ) : !isFree ? (
                <div className="rounded-lg border border-green-200 bg-green-50 p-2 text-[12px] text-green-800">
                  <ShieldCheck className="mr-1 inline-block h-4 w-4 align-text-bottom" />
                  You own this ebook.
                </div>
              ) : null}

              {/* Secure notice */}
              <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-gray-500">
                <Shield className="h-3.5 w-3.5" />
                Secure Stripe checkout
              </div>

              {/* Meta */}
              <div className="mt-3 border-t pt-3 text-xs text-gray-600">
                {ebook.category && (
                  <div>
                    Category: <b className="text-gray-800">{ebook.category}</b>
                  </div>
                )}
                {ebook.publishedAt && (
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="h-3.5 w-3.5 text-gray-500" />
                    Published: {new Date(ebook.publishedAt).toLocaleDateString()}
                  </div>
                )}
              </div>

              {/* Mobile thumb (if not shown on left) */}
              {ebook.thumbnail && (
                <div className="mt-3 block lg:hidden">
                  <div className="aspect-video max-h-40 w-full overflow-hidden rounded-xl border bg-gray-50">
                    <img
                      src={ebook.thumbnail}
                      alt={ebook.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
