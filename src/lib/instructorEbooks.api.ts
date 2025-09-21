import { api } from '@/lib/api'

// TEMP base — reuse resources backend until ebooks routes exist
const BASE = '/instructor/ebooks'

// -------- Types --------
export type MyEbookListItem = {
  id: string
  title: string
  slug: string
  status: 'draft' | 'published' | 'archived'
  category?: string
  thumbnail?: string
  pricing?: {
    amountMinor?: number
    currency?: 'GBP'|'USD'|'EUR'
    isFree?: boolean
    includedInMembership?: boolean
  }
  updatedAt: string
  publishedAt?: string
}
export type MyEbooksResponse = {
  items: MyEbookListItem[]
  meta: { page: number; limit: number; total: number; hasNextPage: boolean }
}

export type MyEbook = {
  id: string
  title: string
  slug: string
  status: 'draft'|'published'|'archived'
  description?: string
  category?: string
  thumbnail?: string
  pricing?: {
    amountMinor?: number
    currency?: 'GBP'|'USD'|'EUR'
    isFree?: boolean
    includedInMembership?: boolean
  }
  publishedAt?: string
  updatedAt: string
}

export type MyEbookItem = {
  id: string
  title: string
  type: 'link'|'file'
  order: number
  link?: { url: string; note?: string }
  file?: { url: string; fileName?: string; size?: number; mimeType?: string }
}

// -------- List (instructor) --------
export async function listMyInstructorEbooks(params: Record<string, any> = {}) {
  const { data } = await api.get<MyEbooksResponse>(BASE, { params })
  data.items = (data.items as any[]).map((r) => ({ ...r, id: (r as any).id ?? (r as any)._id }))
  return data
}

// -------- CRUD (instructor) --------
export async function createDraftEbook(body: { title: string }) {
  const { data } = await api.post<{ id: string }>(BASE, body)
  return data
}
export async function getMyEbook(id: string | null) {
  if (!id) return null as any
  const { data } = await api.get<{ resource: MyEbook }>(`${BASE}/${id}`)
  const ebook = { ...(data as any).resource }
  ebook.id = (ebook as any).id ?? (ebook as any)._id
  return { ebook: ebook as MyEbook }
}
export async function updateEbookBasics(id: string, body: {
  title: string; description?: string; category?: string; thumbnail?: string
}) {
  const { data } = await api.patch(`${BASE}/${id}/basics`, body)
  return data
}
export async function updateEbookPricing(id: string, body: {
  amountMajor: number; currency: 'GBP'|'USD'|'EUR'; includedInMembership: boolean
}) {
  const { data } = await api.patch(`${BASE}/${id}/pricing`, body)
  return data
}
export async function publishEbook(id: string)   { const { data } = await api.post(`${BASE}/${id}/publish`, {}); return data }
export async function unpublishEbook(id: string) { const { data } = await api.post(`${BASE}/${id}/unpublish`, {}); return data }
export async function archiveEbook(id: string)   { const { data } = await api.post(`${BASE}/${id}/archive`, {}); return data }
export async function restoreEbook(id: string)   { const { data } = await api.post(`${BASE}/${id}/restore`, {}); return data }
export async function deleteEbook(id: string)    { const { data } = await api.delete(`${BASE}/${id}`); return data }

// -------- Items (instructor) --------
export async function listEbookItems(id: string) {
  const { data } = await api.get<any[]>(`${BASE}/${id}/items`)
  return data.map((it: any) => ({ ...it, id: it.id ?? it._id }))
}
export async function createEbookItem(id: string, payload: Omit<MyEbookItem,'id'|'order'>) {
  const { data } = await api.post(`${BASE}/${id}/items`, payload)
  return data
}
export async function updateEbookItem(id: string, itemId: string, patch: Partial<MyEbookItem>) {
  const { data } = await api.patch(`${BASE}/${id}/items/${itemId}`, patch)
  return data
}
export async function deleteEbookItem(id: string, itemId: string) {
  const { data } = await api.delete(`${BASE}/${id}/items/${itemId}`)
  return data
}
export async function reorderEbookItems(id: string, orderedIds: string[]) {
  const { data } = await api.post(`${BASE}/${id}/items/reorder`, { orderedIds })
  return data
}
