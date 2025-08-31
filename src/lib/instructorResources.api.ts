import { api } from '@/lib/api'

/* ===================== Types ===================== */

export type ResourcePricing = {
  amountMinor?: number
  currency?: 'GBP' | 'USD' | 'EUR'
  isFree?: boolean
  includedInMembership?: boolean
}

export type ResourceItem = {
  id: string
  title: string
  type: 'link' | 'file'
  order: number
  link?: { url: string; note?: string }
  file?: { url: string; fileName?: string; size?: number; mimeType?: string }
}

export type Resource = {
  id: string
  slug: string
  status: 'draft' | 'published' | 'archived'
  title?: string
  description?: string
  category?: string
  thumbnail?: string
  pricing?: ResourcePricing
  publishedAt?: string | null
  updatedAt?: string
}

export type MyResourceListItem = {
  id: string
  title: string
  slug: string
  status: 'draft' | 'published' | 'archived'
  thumbnail?: string
  category?: string
  pricing?: ResourcePricing
  updatedAt: string
  publishedAt?: string | null
}

export type MyResourcesResponse = {
  items: MyResourceListItem[]
  meta: { page: number; limit: number; total: number; hasNextPage: boolean }
}

/* ===================== Instructor shell ===================== */

export async function createDraftResource(
  body: { title: string } & Partial<ResourcePricing>
) {
  const { data } = await api.post<{ resource: Resource }>(
    '/instructor/resources',
    body
  )
  return data.resource
}

export async function getMyResource(resourceId: string) {
  const { data } = await api.get<{ resource: Resource; items: ResourceItem[] }>(
    `/instructor/resources/${resourceId}`
  )
  return data
}

export async function updateResourceBasics(
  resourceId: string,
  body: Partial<Pick<Resource, 'title' | 'description' | 'category' | 'thumbnail'>>
) {
  const { data } = await api.patch<{ resource: Resource }>(
    `/instructor/resources/${resourceId}`,
    body
  )
  return data.resource
}

export async function updateResourcePricing(
  resourceId: string,
  body: {
    amountMinor?: number
    amountMajor?: number
    currency?: 'GBP' | 'USD' | 'EUR'
    includedInMembership?: boolean
  }
) {
  const { data } = await api.patch<{
    resource: Pick<Resource, 'id' | 'pricing' | 'updatedAt'>
  }>(`/instructor/resources/${resourceId}/pricing`, body)
  return data.resource
}

export async function publishResource(resourceId: string) {
  const { data } = await api.post<{
    ok: true
    resource: Pick<Resource, 'id' | 'slug' | 'status' | 'publishedAt'>
  }>(`/instructor/resources/${resourceId}/publish`)
  return data.resource
}

export async function unpublishResource(resourceId: string) {
  const { data } = await api.post<{
    ok: true
    resource: Pick<Resource, 'id' | 'status' | 'publishedAt'>
  }>(`/instructor/resources/${resourceId}/unpublish`)
  return data.resource
}

export async function archiveResource(resourceId: string) {
  const { data } = await api.post<{
    ok: true
    resource: Pick<Resource, 'id' | 'status'> & { archivedAt?: string }
  }>(`/instructor/resources/${resourceId}/archive`)
  return data.resource
}

export async function restoreResource(resourceId: string) {
  const { data } = await api.post<{
    ok: true
    resource: Pick<Resource, 'id' | 'status'> & { archivedAt?: string }
  }>(`/instructor/resources/${resourceId}/restore`)
  return data.resource
}

export async function deleteResource(resourceId: string) {
  const { data } = await api.delete<{ deleted: true }>(
    `/instructor/resources/${resourceId}`
  )
  return data.deleted
}

/* ===================== List mine (MISSING BEFORE) ===================== */

export async function listMyInstructorResources(params: {
  status?: 'draft' | 'published' | 'archived'
  q?: string
  page?: number
  limit?: number
}) {
  const { data } = await api.get<MyResourcesResponse>('/instructor/resources', {
    params,
  })
  return data
}

/* ===================== Items ===================== */

export async function listResourceItems(resourceId: string) {
  const { data } = await api.get<{ items: ResourceItem[] }>(
    `/instructor/resources/${resourceId}/items`
  )
  return data.items
}

export async function createResourceItem(
  resourceId: string,
  payload:
    | {
        title: string
        type: 'link'
        order?: number
        link: { url: string; note?: string }
      }
    | {
        title: string
        type: 'file'
        order?: number
        file: { url: string; fileName?: string; size?: number; mimeType?: string }
      }
) {
  const { data } = await api.post<{ item: ResourceItem }>(
    `/instructor/resources/${resourceId}/items`,
    payload
  )
  return data.item
}

export async function updateResourceItem(
  resourceId: string,
  itemId: string,
  payload: Partial<ResourceItem> & {
    link?: { url?: string; note?: string }
    file?: { url?: string; fileName?: string; size?: number; mimeType?: string }
  }
) {
  const { data } = await api.patch<{ item: ResourceItem }>(
    `/instructor/resources/${resourceId}/items/${itemId}`,
    payload as any
  )
  return data.item
}

export async function deleteResourceItem(
  resourceId: string,
  itemId: string
) {
  const { data } = await api.delete<{ deleted: true }>(
    `/instructor/resources/${resourceId}/items/${itemId}`
  )
  return data.deleted
}

export async function reorderResourceItems(
  resourceId: string,
  order: string[]
) {
  const { data } = await api.post<{ ok: true }>(
    `/instructor/resources/${resourceId}/items:reorder`,
    { order }
  )
  return data.ok
}
