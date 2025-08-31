import { api } from '@/lib/api';

export type MembershipPlan = {
  id: 'yearly' | 'lifetime';
  title: string;
  interval: '12-months' | 'one-time';
  priceId?: string;
  priceMinor?: number;
  currency?: 'GBP';
  badge?: string;
};

export type Membership = {
  userId: string;
  plan: 'yearly' | 'lifetime';
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'incomplete';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  provider: 'stripe';
  stripe?: {
    customerId?: string;
    subscriptionId?: string;
    priceId?: string;
    latestInvoiceId?: string;
  };
};

export async function listPlans() {
  const { data } = await api.get<{ plans: MembershipPlan[] }>('/memberships/plans');
  return data.plans;
}

export async function getMyMembership() {
  const { data } = await api.get<{ membership: Membership | null }>('/me/membership');
  return data.membership; // q.data is the membership directly
}

export async function checkoutMembership(input: { planId: 'yearly' | 'lifetime' }) {
  const { data } = await api.post<{ checkoutUrl: string; sessionId?: string; planId?: 'yearly'|'lifetime' }>(
    '/me/membership/checkout',
    input
  );
  return data;
}

export async function cancelMembership() {
  const { data } = await api.post<{ ok: true; cancelAtPeriodEnd: boolean }>(
    '/me/membership/cancel',
    {}
  );
  return data;
}
