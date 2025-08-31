// Single source for structure + curriculum APIs
import { api } from '@/lib/api'

export type Section = {
  id: string; courseId: string; title: string; order: number
  createdAt?: string; updatedAt?: string
}

export type VideoBlock = {
  provider?: 'mux'|'s3'|'cloudflare'|'youtube'
  assetId?: string; url?: string; durationSec?: number
  captions?: { lang: string; url: string }[]
}

export type Lesson =
  | { id: string; sectionId: string; title: string; order: number; type: 'video'; video: VideoBlock; resources?: string[]; updatedAt?: string }
  | { id: string; sectionId: string; title: string; order: number; type: 'text';  textContent: string; resources?: string[]; updatedAt?: string }
  | { id: string; sectionId: string; title: string; order: number; type: 'quiz';  quizId: string;   resources?: string[]; updatedAt?: string }

export type CurriculumResponse = {
  sections: (Section & { lessons: Lesson[] })[];
  meta: { counts: { sections: number; lessons: number } };
};

// READ
export async function getCurriculum(courseId: string) {
  const { data } = await api.get<CurriculumResponse>(`/instructor/courses/${courseId}/curriculum`);
  return data;
}

// SECTIONS
export async function createSection(courseId: string, body: { title: string; order?: number }) {
  const { data } = await api.post<{ section: Section }>(`/instructor/courses/${courseId}/sections`, body);
  return data.section;
}
export async function updateSection(sectionId: string, body: { title?: string }) {
  const { data } = await api.patch<{ section: Section }>(`/instructor/sections/${sectionId}`, body);
  return data.section;
}
export async function reorderSection(sectionId: string, toIndex: number) {
  const { data } = await api.post<{ section: Pick<Section,'id'|'courseId'|'order'> }>(`/instructor/sections/${sectionId}/reorder`, { toIndex });
  return data.section;
}
export async function deleteSection(sectionId: string) {
  const { data } = await api.delete<{ deleted: boolean }>(`/instructor/sections/${sectionId}`);
  return data.deleted;
}

// LESSONS
export type CreateLessonBody =
  | { title: string; type: 'video'; video: VideoBlock; order?: number; resources?: string[] }
  | { title: string; type: 'text';  textContent: string; order?: number; resources?: string[] }
  | { title: string; type: 'quiz';  quizId: string; order?: number; resources?: string[] }

export async function createLesson(sectionId: string, body: CreateLessonBody) {
  const { data } = await api.post<{ lesson: Lesson }>(`/instructor/sections/${sectionId}/lessons`, body);
  return data.lesson;
}
export async function updateLesson(lessonId: string, body: Partial<CreateLessonBody> & { type?: 'video'|'text'|'quiz'; title?: string; resources?: string[] }) {
  const { data } = await api.patch<{ lesson: Lesson }>(`/instructor/lessons/${lessonId}`, body);
  return data.lesson;
}
export async function reorderLesson(lessonId: string, toIndex: number) {
  const { data } = await api.post<{ lesson: Pick<Lesson,'id'|'sectionId'|'order'> }>(`/instructor/lessons/${lessonId}/reorder`, { toIndex });
  return data.lesson;
}
export async function deleteLesson(lessonId: string) {
  const { data } = await api.delete<{ deleted: boolean }>(`/instructor/lessons/${lessonId}`);
  return data.deleted;
}
