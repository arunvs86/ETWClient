// src/lib/instructorQuizzes.api.ts
import { api } from '@/lib/api'

export type InstructorQuiz = {
  id: string
  ownerId: string
  slug: string
  courseId?: string | null

  title: string
  description?: string

  timeLimitSec: number
  attemptsAllowed: number
  passPercent: number
  isPublished: boolean
  visibility: 'enrolled' | 'public'
  shuffleQuestions: boolean
  shuffleOptions: boolean

  questionCount: number
  totalPoints: number

  // NEW
  pricing: {
    isFree: boolean
    includedInMembership: boolean
    amountMinor: number
    currency: 'GBP'|'USD'|'EUR'
  }

  attemptCount?: number
  passCount?: number
  avgPercent?: number

  archivedAt?: string | null
  createdAt?: string
  updatedAt?: string
}

export type MyQuizzesResponse = {
  items: InstructorQuiz[]
  meta: { page: number; limit: number; total: number; hasNextPage: boolean }
}

/** Create a quiz (standalone by default; courseId optional) */
export async function createQuiz(body: {
  title: string
  description?: string
  timeLimitSec?: number
  attemptsAllowed?: number
  passPercent?: number
  visibility?: 'enrolled' | 'public'
  shuffleQuestions?: boolean
  shuffleOptions?: boolean
  /** optional linkage */
  courseId?: string
}) {
  const { data } = await api.post<{ quiz: InstructorQuiz }>('/instructor/mock/quizzes', body)
  return data.quiz
}

/** Update basics / rules */
export async function updateQuizBasics(
  quizId: string,
  body: Partial<{
    title: string
    description: string
    timeLimitSec: number
    attemptsAllowed: number
    passPercent: number
    visibility: 'enrolled' | 'public'
    shuffleQuestions: boolean
    shuffleOptions: boolean
    pricing: { isFree: boolean; includedInMembership: boolean; amountMinor: number; currency: string } // ✅ added
  }>
) {
  const { data } = await api.patch<{ quiz: InstructorQuiz }>(
    `/instructor/mock/quizzes/${quizId}`,
    body
  )
  return data.quiz
}

/** Publish / Unpublish */
export async function publishQuiz(quizId: string) {
  const { data } = await api.post<{ ok: true; quiz: InstructorQuiz }>(`/instructor/mock/quizzes/${quizId}/publish`)
  return data.quiz
}
export async function unpublishQuiz(quizId: string) {
  const { data } = await api.post<{ ok: true; quiz: InstructorQuiz }>(`/instructor/mock/quizzes/${quizId}/unpublish`)
  return data.quiz
}

/** Delete (only if unpublished and no attempts) */
export async function deleteQuiz(quizId: string) {
  const { data } = await api.delete<{ deleted: boolean }>(`/instructor/mock/quizzes/${quizId}`)
  return data.deleted
}

/** List my quizzes (optionally filter by courseId) */
export async function listMyQuizzes(params: { courseId?: string; q?: string; page?: number; limit?: number } = {}) {
  const { data } = await api.get<MyQuizzesResponse>('/instructor/mock/quizzes', { params })
  return data
}

/** Get one quiz */
export async function getMyQuiz(quizId: string) {
  const { data } = await api.get<{ quiz: InstructorQuiz }>(`/instructor/mock/quizzes/${quizId}`)
  return data.quiz
}
