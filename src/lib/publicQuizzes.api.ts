// src/lib/publicQuizzes.api.ts
import { api } from '@/lib/api'

export type QuizPublic = {
  id: string
  slug: string
  title: string
  description?: string
  timeLimitSec: number
  attemptsAllowed: number
  passPercent: number
  visibility: 'enrolled'|'public'
  isPublished: boolean
  questionCount: number
  totalPoints: number
  pricing: { isFree: boolean; includedInMembership: boolean; amountMinor: number; currency: 'GBP'|'USD'|'EUR' }
}

export type PlayQuestion = {
  id: string
  type: 'mcq'|'multi'|'boolean'|'short'
  prompt: string
  options?: { id: string; text: string }[]
  points: number
}

export type QuizBySlugResp = {
  quiz: QuizPublic
  questions: PlayQuestion[]
  entitlement?: {
    isFree: boolean
    includedInMembership: boolean
    memberActive: boolean
    purchased: boolean
    canStart: boolean
  }
}

export async function listPublishedQuizzes(params?: { q?: string; page?: number; limit?: number }) {
  const { data } = await api.get<QuizListResp>('/api/quizzes', { params })
  return data
}

export async function getQuizBySlug(slug: string) {
  const { data } = await api.get<QuizBySlugResp>(`/quizzes/${slug}`)
  return data
}

export async function startAttempt(slug: string) {
  const { data } = await api.post<{
    attempt: { id: string; status: 'in_progress'|'submitted'; startedAt: string; timeLimitSec: number; expiresAt: string|null }
    quiz: QuizPublic
    questions: PlayQuestion[]
  }>(`/api/quizzes/${encodeURIComponent(slug)}/start`, {})
  return data
}

export async function upsertAnswers(attemptId: string, answers: Array<{
  questionId: string
  selectedOptionIds?: string[]
  booleanAnswer?: boolean
  textAnswer?: string
}>) {
  const { data } = await api.patch<{ ok: boolean; attemptId: string; answersCount: number }>(
    `/api/attempts/${encodeURIComponent(attemptId)}/answers`,
    { answers }
  )
  return data
}

export async function submitAttempt(attemptId: string) {
  const { data } = await api.post<{
    attempt: {
      id: string; status: 'submitted'; startedAt: string; completedAt: string;
      timeTakenSec: number; score: number; maxScore: number; percent: number; passed: boolean;
    }
    quiz: QuizPublic
    results: { perQuestion: Array<PlayQuestion & {
      explanation?: string
      correctOptionIds?: string[]
      correctBoolean?: boolean
      correctText?: string[]
      grade: { earned: number; max: number; correct: boolean }
    }>}
  }>(`/api/attempts/${encodeURIComponent(attemptId)}/submit`, {})
  return data
}

export async function getAttempt(attemptId: string) {
  const { data } = await api.get<any>(`/api/attempts/${encodeURIComponent(attemptId)}`)
  return data
}

export async function createQuizCheckout(slug: string) {
  const { data } = await api.post<{ checkoutUrl: string; sessionId: string }>(`/quizzes/${slug}/checkout`)
  return data
}