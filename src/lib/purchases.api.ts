// src/lib/purchases.api.ts
import { api } from '@/lib/api';

export type PurchaseKind = 'ebook' | 'resource' | 'quiz' | 'live-session' | 'course';

export type PurchaseItem = {
  id: string;                 // `${kind}:${refId}`
  kind: PurchaseKind;
  refId: string;
  slug?: string;
  title: string;
  thumbnail?: string;
  purchasedAt: string;
  priceMinor: number;
  currency: 'GBP'|'USD'|'EUR';
  deepLink: string;
};

export type PurchasesResponse = {
  items: PurchaseItem[];
  meta: { page: number; limit: number; total: number; hasNextPage: boolean };
};

export async function listMyPurchases(params?: {
  kinds?: PurchaseKind[] | string;
  q?: string;
  page?: number;
  limit?: number;
}) {
  const p = { ...(params || {}) } as any;
  if (Array.isArray(p.kinds)) p.kinds = p.kinds.join(',');
  const { data } = await api.get<PurchasesResponse>('/me/purchases', { params: p });
  return data;
}

// Typed aliases (optional)
export async function listMyEbookPurchases(limit = 6) {
  const { data } = await api.get<PurchasesResponse>('/me/purchases/ebooks', { params: { limit } });
  return data;
}
export async function listMyResourcePurchases(limit = 6) {
  const { data } = await api.get<PurchasesResponse>('/me/purchases/resources', { params: { limit } });
  return data;
}
export async function listMyQuizPurchases(limit = 6) {
  const { data } = await api.get<PurchasesResponse>('/me/purchases/quizzes', { params: { limit } });
  return data;
}
export async function listMyLivePurchases(limit = 6) {
  const { data } = await api.get<PurchasesResponse>('/me/purchases/live-sessions', { params: { limit } });
  return data;
}

