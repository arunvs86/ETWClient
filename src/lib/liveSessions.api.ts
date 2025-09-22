// src/lib/liveSessions.api.ts
import { api,apiPublic } from '@/lib/api';
import axios from "axios";

export type Currency = 'GBP' | 'USD' | 'EUR';
export type MembersAccess = 'free' | 'paid' | 'none';
export type SessionStatus = 'scheduled' | 'live' | 'ended' | 'canceled';

export type LiveSessionPricing = {
  type: 'free' | 'paid';
  amountMinor?: number;
  currency?: Currency;
};

export type ZoomInput = {
  joinUrl?: string;
  passcode?: string;
  startUrl?: string;
};

export type PublicLiveSession = {
  id: string;
  hostUserId: string;
  title: string;
  description?: string;
  thumbnail?: string;
  startAt: string;
  endAt: string;
  timezone?: string;
  status: SessionStatus;
  visibility: 'public' | 'course';
  capacity?: number;
  pricing: LiveSessionPricing;
  membersAccess: MembersAccess;
  createdAt?: string;
  updatedAt?: string;
};

export type ListResponse = {
  results: PublicLiveSession[];
  total: number;
  page: number;
  pageSize: number;
};

export type CreateLiveSessionBody = {
  title: string;
  description?: string;
  startAt: string;
  endAt: string;
  timezone?: string;
  visibility?: 'public' | 'course';
  capacity?: number;
  pricing?: { type: 'free' | 'paid'; amountMinor?: number; currency?: Currency };
  membersAccess?: MembersAccess;
  thumbnail?: string;
  zoom?: ZoomInput;           // ← NEW
};

export type EntitlementResponse =
  | { canJoin: true; source: 'free' | 'membership' | 'purchase' }
  | { canJoin: false; reason: 'auth_required' | 'purchase_required' | 'purchase_required_even_for_members' };

export function prettyPrice(p?: LiveSessionPricing) {
  if (!p || p.type === 'free' || !p.amountMinor) return 'Free';
  const n = (p.amountMinor || 0) / 100;
  try { return new Intl.NumberFormat(undefined, { style: 'currency', currency: p.currency || 'GBP' }).format(n); }
  catch { return `${n.toFixed(2)} ${p.currency || ''}`; }
}

/* ---------- Reads ---------- */
export async function listLiveSessions(params: {
  status?: SessionStatus;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
  visibility?: 'public' | 'course';
}) {
  const { data } = await apiPublic.get<ListResponse>("/live-sessions", { params });
  const results = (data.results || []).map((s: any) => ({ ...s, id: s.id ?? s._id }));
  return { ...data, results };
}

export async function getLiveSession(id: string) {
  const { data } = await api.get<PublicLiveSession>(`/live-sessions/${encodeURIComponent(id)}`);
  const s: any = data;
  return { ...s, id: s.id ?? s._id } as PublicLiveSession;
}

export async function getEntitlement(id: string) {
  const { data } = await api.get(
    `/live-sessions/${encodeURIComponent(id)}/entitlement`,
    { params: { _t: Date.now() } }   // ← remove headers: { 'Cache-Control': 'no-cache' }
  );
  return data;
}

export async function joinLiveSession(id: string) {
  const { data } = await api.get(
    `/live-sessions/${encodeURIComponent(id)}/join`,
    { params: { _t: Date.now() } }   // ← remove headers here too
  );
  return data;
}

/* ---------- Instructor actions ---------- */
export async function createLiveSession(body: CreateLiveSessionBody) {
  const { data } = await api.post<PublicLiveSession>('/live-sessions', body);
  const s: any = data;
  return { ...s, id: s.id ?? s._id } as PublicLiveSession;
}

export async function updateLiveSession(id: string, body: Partial<CreateLiveSessionBody>) {
  const { data } = await api.patch<PublicLiveSession>(`/live-sessions/${encodeURIComponent(id)}`, body);
  const s: any = data;
  return { ...s, id: s.id ?? s._id } as PublicLiveSession;
}

/* ---------- Checkout / Confirm ---------- */
export async function createLiveSessionCheckout(sessionId: string) {
  const { data } = await api.post<{ checkoutUrl: string; sessionId?: string }>(
    `/me/live-sessions/${encodeURIComponent(sessionId)}/checkout`,
    {}
  );
  return data;
}

export async function confirmLivePurchase(sessionId: string, stripeSessionId: string) {
  const { data } = await api.post<{ ok: boolean; granted?: boolean }>(
    `/me/live-sessions/${encodeURIComponent(sessionId)}/confirm`,
    { sessionId: stripeSessionId }
  );
  return data;
}

/* ---------- DEV only ---------- */
export async function devPurchaseLiveSession(id: string) {
  const { data } = await api.post<{ ok: true; orderId: string }>(`/live-sessions/${encodeURIComponent(id)}/purchase`, {});
  return data;
}
