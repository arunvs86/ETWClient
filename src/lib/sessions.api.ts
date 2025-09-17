// src/lib/sessions.api.ts
import { api, ensureAuth } from '@/lib/api';

export type TutoringSession = {
  _id: string;
  tutorId: string;
  studentId: string;
  startAt: string; // ISO
  endAt: string;   // ISO
  currency: string;
  amountMinor: number;
  status: 'hold'|'payment_pending'|'confirmed'|'cancelled'|'completed'|'refunded';
  holdExpiresAt?: string;
  meetingLink?: string;
  notes?: string;
  cancelRequest?: {
    requestedBy: string;
    reason: string;
    requestedAt: string;
    approvedAt?: string;
    approvedBy?: string;
  };
};

export type ListMineParams = {
  role?: 'student'|'tutor';
  status?: string;        // csv
  from?: string;          // YYYY-MM-DD
  to?: string;            // YYYY-MM-DD
  page?: number;
  limit?: number;
};
export type ListMineResponse = {
  page: number;
  limit: number;
  total: number;
  items: TutoringSession[];
};

export async function listMySessions(params: ListMineParams) {
  await ensureAuth();
  const { data } = await api.get<ListMineResponse>('/me/tutoring-sessions', { params });
  return data;
}
export async function getMySession(id: string) {
  await ensureAuth();
  const { data } = await api.get<{ /* raw */ }>(`/me/tutoring-sessions/${encodeURIComponent(id)}`);
  return data as any as TutoringSession;
}
export async function cancelMySession(id: string) {
  await ensureAuth();
  const { data } = await api.patch<{ message: string; session: TutoringSession }>(
    `/me/tutoring-sessions/${encodeURIComponent(id)}/cancel`, {}
  );
  return data.session;
}
export async function requestCancelMySession(id: string, reason: string) {
  await ensureAuth();
  const { data } = await api.patch<{ message: string; session: TutoringSession }>(
    `/me/tutoring-sessions/${encodeURIComponent(id)}/cancel-request`, { reason }
  );
  return data.session;
}
export async function rescheduleMySession(id: string, body: { startAt: string; endAt: string }) {
  await ensureAuth();
  const { data } = await api.patch<{ message: string; session: TutoringSession }>(
    `/me/tutoring-sessions/${encodeURIComponent(id)}/reschedule`, body
  );
  return data.session;
}

// Tutor endpoints
export async function tutorListSessions(params: Omit<ListMineParams, 'role'>) {
  await ensureAuth();
  const { data } = await api.get<ListMineResponse>('/me/tutor/sessions', { params });
  return data;
}
export async function tutorCompleteSession(id: string) {
  await ensureAuth();
  const { data } = await api.patch<{ message: string; session: TutoringSession }>(
    `/me/tutor/sessions/${encodeURIComponent(id)}/complete`, {}
  );
  return data.session;
}
export async function tutorApproveCancel(id: string) {
  await ensureAuth();
  const { data } = await api.patch<{ message: string; session: TutoringSession }>(
    `/me/tutor/sessions/${encodeURIComponent(id)}/approve-cancel`, {}
  );
  return data.session;
}
