// src/lib/tutorOwner.api.ts
import { api, ensureAuth } from '@/lib/api';

export type MyTutorProfile = {
  userId: string;
  headline: string;
  bio: string;
  subjects: string[];
  languages: string[];
  timezone: string;
  hourlyRateMinor: number;
  currency: string;
  meetingProvider: 'zoom'|'google_meet'|'custom';
  meetingNote?: string;
  isListed: boolean;
};

export type MyAvailability = {
  timezone: string;
  slotSizeMin: number;  // default 60
  bufferMin: number;    // default 0
  weekly: Array<{ dow: number; start: string; end: string }>; // dow: 0..6, HH:mm
  // Expanded so we can send simple date windows:
  exceptions: Array<{
    date: string;            // YYYY-MM-DD
    reason?: string;
    // Optional explicit window(s) for this date — friendly shape
    start?: string;          // HH:mm
    end?: string;            // HH:mm
    // Or multiple blocks (friendly or DB shape)
    blocks?: Array<{
      start?: string; end?: string;     // HH:mm friendly
      startMin?: number; endMin?: number; // DB shape (minutes)
    }>;
    // DB shape (single window) also tolerated:
    startMin?: number;
    endMin?: number;
  }>;
};

// ---- Profile
export async function getMyTutorProfile(): Promise<{ profile?: MyTutorProfile }> {
  await ensureAuth();
  const { data } = await api.get('/me/tutor/profile');
  return data;
}

export async function upsertMyTutorProfile(body: Partial<MyTutorProfile>): Promise<{ profile: MyTutorProfile }> {
  await ensureAuth();
  const { data } = await api.put('/me/tutor/profile', body);
  return data;
}

// ---- Availability
export async function getMyTutorAvailability(): Promise<{ availability?: MyAvailability }> {
  await ensureAuth();
  const { data } = await api.get('/me/tutor/availability');
  return data;
}

export async function saveMyTutorAvailability(body: MyAvailability): Promise<{ availability: MyAvailability }> {
  await ensureAuth();
  const { data } = await api.put('/me/tutor/availability', body);
  return data;
}
