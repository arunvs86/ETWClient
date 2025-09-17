// src/lib/tutorDetail.api.ts
import { api, ensureAuth } from '@/lib/api';

export type TutorPublicDetail = {
  profile: {
    userId: string;
    headline: string;
    bio: string;
    subjects: string[];
    languages: string[];
    timezone: string;
    hourlyRateMinor: number;
    currency: string;
    meetingProvider: 'zoom' | 'google_meet' | 'custom';
    meetingNote?: string;
    isListed: boolean;
    ratingAvg: number;
    ratingCount: number;
    createdAt: string;
    updatedAt: string;
  };
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
};

export type AvailabilitySlot = {
  startAt: string; // UTC ISO
  endAt: string;   // UTC ISO
  local: {
    timezone: string; // tutor tz
    start: string;    // ISO in tutor tz
    end: string;      // ISO in tutor tz
    date: string;     // YYYY-MM-DD in tutor tz
  };
};

export async function getTutorPublicDetail(tutorId: string): Promise<TutorPublicDetail> {
  const { data } = await api.get<TutorPublicDetail>(`/tutors/${encodeURIComponent(tutorId)}`);
  return data;
}

export async function getTutorAvailability(tutorId: string, params: {
  from: string; // YYYY-MM-DD
  to: string;   // YYYY-MM-DD
  durationMin?: number;
}): Promise<{ slots: AvailabilitySlot[] }> {
  const { data } = await api.get<{ slots: AvailabilitySlot[] }>(
    `/tutors/${encodeURIComponent(tutorId)}/availability`,
    { params }
  );
  return data;
}

export async function createTutoringCheckout(tutorId: string, body: {
  startAt: string; // UTC ISO
  endAt: string;   // UTC ISO
}): Promise<{ url: string; sessionId: string }> {
  // ensure auth; if you want to redirect on failure, do it in the caller
  await ensureAuth();
  const { data } = await api.post<{ url: string; sessionId: string }>(
    `/tutors/${encodeURIComponent(tutorId)}/checkout`,
    body
  );
  return data;
}
