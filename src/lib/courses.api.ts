import {api} from '@/lib/api'

export type CoursePricing = {
  amountMinor: number;
  currency: 'GBP' | 'USD' | 'EUR';
  isFree: boolean;
  includedInMembership: boolean; 
};


export type CourseListItem = {
    _id?: string;           
  id: string
  title: string
  slug: string
  subtitle?: string
  thumbnail?: string
  pricing: CoursePricing
  level: 'beginner' | 'intermediate' | 'advanced'
  language: string
  category?: string
  tags?: string[]
  ratingAvg?: number
  ratingCount?: number
  enrollmentCount?: number
  totalDurationSec?: number
  publishedAt?: string
}

export type CourseListResponse = {
  items: CourseListItem[]
  meta: { page: number; limit: number; total: number; hasNextPage: boolean }
}

export type CoursePublic = CourseListItem & {
  description?: string
  promoVideoUrl?: string
  updatedAt?: string
  sections?: { id: string; title: string; order: number; lessons?: { id: string; title: string; order: number }[] }[]
}

export async function listCourses(params: Record<string, string | number | boolean | undefined>) {
  const { data } = await api.get<CourseListResponse>('/courses', { params })
  return data
}

export async function getCourseBySlug(slug: string) {
  const { data } = await api.get<{ course: any }>(`/courses/${encodeURIComponent(slug)}`);
  const c = data.course || {};
  return { ...c, id: c.id ?? c._id } as CoursePublic;
}

export async function getOwned(slug: string) {
  const { data } = await api.get<{ owned: boolean }>(`/me/courses/${encodeURIComponent(slug)}/owned`);
  return data.owned;
}

export async function createCourseCheckout(courseId: string) {
  const { data } = await api.post<{ checkoutUrl: string; sessionId: string }>(
    `/me/courses/${encodeURIComponent(courseId)}/checkout`,
    {}
  );
  return data;
}
