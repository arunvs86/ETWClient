// src/lib/instructorCourses.api.ts
import { api } from '@/lib/api'

/* ===================== Types ===================== */

export type CoursePricing = {
  amountMinor?: number
  currency?: 'GBP' | 'USD' | 'EUR'
  isFree?: boolean
}

export type InstructorCourse = {
  id: string
  slug: string
  status: 'draft' | 'published' | 'archived'
  title?: string
  subtitle?: string
  description?: string
  language?: string
  level?: 'beginner' | 'intermediate' | 'advanced'
  category?: string
  tags?: string[]
  promoVideoUrl?: string
  thumbnail?: string
  pricing?: CoursePricing
  publishedAt?: string | null
  updatedAt?: string
}

export type VideoBlock = {
  provider?: 'mux' | 's3' | 'cloudflare' | 'youtube'
  assetId?: string
  url?: string
  durationSec?: number
  captions?: { lang: string; url: string }[]
}

export type SingleLesson =
  | {
      id: string
      title: string
      type: 'video'
      video: Required<VideoBlock> & { provider: 'youtube' }
      resources?: string[]
      order: number
      updatedAt?: string
    }

/* ===================== Create / Update (Instructor) ===================== */

type CreateDraftBody = {
  title: string
  subtitle?: string
  description?: string
  language?: string
  level?: 'beginner' | 'intermediate' | 'advanced'
  category?: string
  tags?: string[] | string
  promoVideoUrl?: string
  thumbnail?: string
  amountMinor?: number
  amountMajor?: number
  currency?: 'GBP' | 'USD' | 'EUR'

  // Optional (you can still upsert lesson after create)
  youtubeUrl?: string
  lessonTitle?: string
  durationSec?: number
  resources?: string[]
}

/** CREATE draft course (minimal: title). Returns created course. */
export async function createDraftCourse(body: Pick<CreateDraftBody, 'title'> & Partial<CreateDraftBody>) {
  const { data } = await api.post<{ course: InstructorCourse }>('/instructor/courses', body)
  return data.course
}

export async function getMyInstructorCourse(courseId: string) {
  const { data } = await api.get<{ course: InstructorCourse }>(`/instructor/courses/${courseId}`)
  return data.course
}

export async function updateCourseBasics(courseId: string, body: Partial<CreateDraftBody>) {
  const { data } = await api.patch<{ course: InstructorCourse }>(`/instructor/courses/${courseId}`, body)
  return data.course
}

export async function updateCoursePricing(
  courseId: string,
  body: { amountMinor?: number; amountMajor?: number; currency?: 'GBP' | 'USD' | 'EUR' }
) {
  const { data } = await api.patch<{ course: Pick<InstructorCourse, 'id' | 'pricing' | 'updatedAt'> }>(
    `/instructor/courses/${courseId}/pricing`,
    body
  )
  return data.course
}

export async function publishCourse(courseId: string) {
  const { data } = await api.post<{ ok: true; course: Pick<InstructorCourse, 'id' | 'slug' | 'status' | 'publishedAt'> }>(
    `/instructor/courses/${courseId}/publish`
  )
  return data.course
}

export async function unpublishCourse(courseId: string) {
  const { data } = await api.post<{ ok: true; course: Pick<InstructorCourse, 'id' | 'status' | 'publishedAt'> }>(
    `/instructor/courses/${courseId}/unpublish`
  )
  return data.course
}

export async function archiveCourse(courseId: string) {
  const { data } = await api.post<{ ok: true; course: Pick<InstructorCourse, 'id' | 'status' | 'publishedAt'> & { archivedAt?: string } }>(
    `/instructor/courses/${courseId}/archive`
  )
  return data.course
}

export async function restoreCourse(courseId: string) {
  const { data } = await api.post<{ ok: true; course: Pick<InstructorCourse, 'id' | 'status'> & { archivedAt?: string } }>(
    `/instructor/courses/${courseId}/restore`
  )
  return data.course
}

export async function deleteCourse(courseId: string) {
  const { data } = await api.delete<{ deleted: boolean }>(`/instructor/courses/${courseId}`)
  return data.deleted
}

/* ===================== List mine ===================== */

export type MyCourseListItem = {
  id: string
  title: string
  slug: string
  status: 'draft' | 'published' | 'archived'
  pricing: CoursePricing
  thumbnail?: string
  updatedAt: string
  publishedAt?: string | null
}

export type MyCoursesResponse = {
  items: MyCourseListItem[]
  meta: { page: number; limit: number; total: number; hasNextPage: boolean }
}

export type MyCoursesParams = {
  status?: 'draft' | 'published' | 'archived'
  q?: string
  page?: number
  limit?: number
}

export async function listMyInstructorCourses(params: MyCoursesParams = {}) {
  const { data } = await api.get<MyCoursesResponse>('/instructor/courses', { params })
  return data
}

/* ===================== Single Lesson (NEW) ===================== */

export async function getSingleLesson(courseId: string) {
  const { data } = await api.get<{ lesson: SingleLesson | null }>(`/instructor/courses/${courseId}/lesson`)
  return data.lesson
}

export async function upsertSingleLesson(
  courseId: string,
  payload: {
    title?: string
    youtubeUrl: string
    durationSec?: number
    resources?: string[]
  }
) {
  const { data } = await api.put<{ lesson: SingleLesson }>(`/instructor/courses/${courseId}/lesson`, payload)
  return data.lesson
}

export async function deleteSingleLesson(courseId: string) {
  const { data } = await api.delete<{ deleted: true }>(`/instructor/courses/${courseId}/lesson`)
  return data.deleted
}
