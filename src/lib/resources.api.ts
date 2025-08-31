import { api } from '@/lib/api'

export type PublicResourceItem = {
  id: string
  title: string
  type: 'link' | 'file'
  order: number
  link?: { url: string; note?: string }
  file?: { url: string; fileName?: string; size?: number; mimeType?: string }
}

export type PublicResource = {
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
}

export type ResourceListResponse = {
  items: PublicResource[]
  meta: { page: number; limit: number; total: number; hasNextPage: boolean }
}

export async function listResources(params: Record<string, any>) {
  const { data } = await api.get<ResourceListResponse>('/resources', { params })
  data.items = data.items.map((r: any) => ({ ...r, id: r.id ?? r._id }))
  return data
}

export async function createResourceCheckout(resourceId: string) {
  const { data } = await api.post<{ checkoutUrl: string; sessionId: string }>(
    `/me/resources/${encodeURIComponent(resourceId)}/checkout`,
    {}
  );
  return data;
}

export async function getResourceBySlug(slug: string) {
  const { data } = await api.get<{
    resource: PublicResource
    items: PublicResourceItem[]
  }>(`/resources/${encodeURIComponent(slug)}`)
  const resource = {
    ...data.resource,
    id: (data.resource as any).id ?? (data.resource as any)._id,
  } as PublicResource
  return { resource, items: data.items }
}

export async function confirmResourcePurchase(sessionId: string) {
  const { data } = await api.post<{ unlocked: boolean }>('/me/resources/confirm', { sessionId });
  return data.unlocked;
}

