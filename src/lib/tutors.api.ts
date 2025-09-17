// src/lib/tutors.api.ts
import { api } from '@/lib/api';

export type TutorListItem = {
  _id: string;
  userId: string; // tutor's User._id
  headline: string;
  bio: string;
  subjects: string[];
  languages: string[];
  timezone: string;
  hourlyRateMinor: number;
  currency: string;
  meetingProvider: 'zoom' | 'google_meet' | 'custom';
  isListed: boolean;
  ratingAvg: number;
  ratingCount: number;
  createdAt: string;
  updatedAt: string;
  user: {
    name: string;
    avatar?: string;
  };
};

export type TutorsListResponse = {
  page: number;
  limit: number;
  total: number;
  items: TutorListItem[];
};

export type TutorsListParams = {
  q?: string;
  subject?: string;
  language?: string;
  minPrice?: number; // minor units (e.g. 2500 = £25.00)
  maxPrice?: number; // minor units
  sort?: 'rating' | 'price_asc' | 'price_desc' | 'recent';
  page?: number;
  limit?: number;
};

/** Raw fetcher (use inside your own query hooks or directly) */
export async function fetchTutors(params: TutorsListParams): Promise<TutorsListResponse> {
  const { data } = await api.get<TutorsListResponse>('/tutors', { params });
  return data;
}
