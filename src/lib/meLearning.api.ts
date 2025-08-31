import { api } from '@/lib/api';

export type EnrolledCourse = {
  id: string;
  title: string;
  slug: string;
  subtitle?: string;
  description?: string;
  thumbnail?: string;
  language?: string;
  level?: 'beginner'|'intermediate'|'advanced';
  category?: string;
  totalDurationSec?: number;
  sections?: { id: string; title: string; order: number; lessons?: any[] }[];
  progress?: { percent: number; completedLessonIds: string[] };
};

/** Returns enrolled course if the user has access; null on 401/403; throws on other errors. */
export async function tryGetEnrolledCourseBySlug(slug: string) {
  try {
    const { data } = await api.get<{ course: EnrolledCourse }>(`/me/courses/${encodeURIComponent(slug)}`);
    return data.course;
  } catch (e: any) {
    const s = e?.response?.status;
    if (s === 401 || s === 403) return null;
    throw e;
  }
}
