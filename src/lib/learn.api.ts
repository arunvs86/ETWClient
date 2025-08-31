import { api, ensureAuth } from '@/lib/api';

export type PlayerVideo = {
  provider?: 'youtube' | 's3' | 'mux' | 'cloudflare';
  url?: string;
  assetId?: string;
  durationSec?: number;
};

export type PlayerLesson = {
  id: string;
  sectionId: string;
  title: string;
  order: number;
  type: 'video' | 'text' | 'quiz';
  video?: PlayerVideo | null;
  textContent?: string;
  quizId?: string | null;
  resources?: string[];
};

export type PlayerSection = {
  id: string;
  courseId: string;
  title: string;
  order: number;
  lessons: PlayerLesson[];
};

export type PlayerBundle = {
  course: {
    id: string;
    title: string;
    slug: string;
    thumbnail?: string;
    pricing?: any;
    status: 'draft' | 'published' | 'archived';
  };
  access: { ok: boolean; reason?: string };
  sections: PlayerSection[];
  progress?: { done: Record<string, boolean> };
};

export async function getPlayerBundle(slug: string) {
  await ensureAuth();
  const { data } = await api.get<PlayerBundle>(`/learn/courses/${encodeURIComponent(slug)}/player`);
  return data;
}
