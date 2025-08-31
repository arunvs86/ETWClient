import { api } from '@/lib/api';

export type EnrollmentCard = {
  enrollmentId?: string; // some responses call it "id"; we'll be defensive
  id?: string;
  userId: string;
  courseId: string;
  via: 'purchase' | 'membership' | 'admin';
  status: 'active' | 'revoked';
  activatedAt: string;
  expiresAt?: string | null;
  course: {
    id: string;
    title: string;
    slug: string;
    thumbnail?: string;
    pricing?: { amountMinor?: number; currency?: 'GBP'|'USD'|'EUR'; isFree?: boolean };
    level?: 'beginner'|'intermediate'|'advanced';
    language?: string;
    category?: string;
    ratingAvg?: number;
    ratingCount?: number;
    enrollmentCount?: number;
    totalDurationSec?: number;
    publishedAt?: string;
  }
};

export type MyEnrollmentsResponse = {
  items: EnrollmentCard[];
  meta: { page: number; limit: number; total: number; hasNextPage: boolean };
};

export async function listMyEnrollments(page = 1, limit = 12) {
  const { data } = await api.get<MyEnrollmentsResponse>('/me/enrollments', { params: { page, limit } });
  return data;
}

export async function enrollInCourse(courseId: string) {
  const { data } = await api.post<{ enrollment: EnrollmentCard }>('/enrollments', { courseId });
  return data.enrollment;
}
