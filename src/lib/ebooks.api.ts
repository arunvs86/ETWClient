import { api } from '@/lib/api'

export type PublicEbookItem = {
  id: string
  title: string
  type: 'link' | 'file'
  order: number
  link?: { url: string; note?: string }
  file?: { url: string; fileName?: string; size?: number; mimeType?: string; kind?: 'full'|'sample' }
}

export type PublicEbook = {
  id?: string
  _id?: string
  slug: string
  title: string
  description?: string
  category?: string
  thumbnail?: string
  pricing?: {
    amountMinor?: number
    currency?: 'GBP' | 'USD' | 'EUR'
    isFree?: boolean
    includedInMembership?: boolean
  }
  publishedAt?: string
  updatedAt?: string
  unlocked?: boolean
}

export type EbookListResponse = {
  items: PublicEbook[]
  meta: { page: number; limit: number; total: number; hasNextPage: boolean }
}

export async function listEbooks(params: Record<string, any>) {
  const { data } = await api.get<EbookListResponse>('/ebooks', { params })
  data.items = data.items.map((r: any) => ({ ...r, id: r.id ?? r._id }))
  return data
}

export async function getEbookBySlug(slug: string) {
  const { data } = await api.get<{ ebook: PublicEbook; items: PublicEbookItem[] }>(
    `/ebooks/${encodeURIComponent(slug)}`
  )
  const ebook = { ...data.ebook, id: (data.ebook as any).id ?? (data.ebook as any)._id } as PublicEbook
  return { ebook, items: data.items }
}

export async function createEbookCheckout(ebookId: string) {
  const { data } = await api.post<{ checkoutUrl: string; sessionId: string }>(
    `/me/ebooks/${encodeURIComponent(ebookId)}/checkout`,
    {}
  )
  return data
}

export async function confirmEbookPurchase(sessionId: string) {
  const { data } = await api.post<{ unlocked: boolean }>(`/me/ebooks/confirm`, { sessionId })
  return data.unlocked
}
