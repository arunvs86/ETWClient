// src/lib/tutorRequest.api.ts
import { api, ensureAuth } from '@/lib/api';

export type TutorRequestPayload = {
  subject: string;
  level?: string;
  availabilityPref?: string;
  urgency?: 'urgent' | 'soon' | 'flexible';
  notes?: string;
};

export type TutorRequestCheckoutResponse = {
  url: string;
  sessionId: string;
  requestId: string;
};

export async function createTutorRequestCheckout(
  body: TutorRequestPayload
): Promise<TutorRequestCheckoutResponse> {
  // make sure user is logged in (will popup/login redirect if you built it that way)
  await ensureAuth();
  const { data } = await api.post<TutorRequestCheckoutResponse>(
    '/tutor-requests/checkout',
    body
  );
  return data;
}

export async function confirmTutorRequest(
  requestId: string,
  sessionId: string
): Promise<{
  ok: boolean;
  status: string;
  request: {
    id: string;
    subject: string;
    level?: string;
    availabilityPref?: string;
    urgency?: string;
    notes?: string;
    createdAt: string;
  };
}> {
  const { data } = await api.post(`/tutor-requests/${encodeURIComponent(requestId)}/confirm`, {
    sessionId,
  });
  return data;
}
