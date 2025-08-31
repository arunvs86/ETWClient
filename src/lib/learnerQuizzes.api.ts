import { api } from '@/lib/api'

export type QuizLite = {
  id: string
  title: string
  description?: string
  visibility: 'public' | 'enrolled'
  isPublished: boolean
  questionCount: number
  totalPoints: number
  passPercent: number
  attemptsAllowed: number
  // optional context if returned by backend:
  courseId?: string
  courseTitle?: string
  thumbnail?: string
  updatedAt?: string
}

export type AttemptLite = {
  id: string
  quizId: string
  status: 'in_progress' | 'submitted'
  startedAt: string
  completedAt?: string
  score?: number
  maxScore?: number
  percent?: number
  passed?: boolean
  attemptNo?: number
  timeTakenSec?: number
}

export type MyQuizzesResponse = {
  items: QuizLite[]
  meta: { page: number; limit: number; total: number; hasNextPage: boolean }
}

/** List quizzes available to the current learner */
export async function listMyQuizzes(params?: { page?: number; limit?: number; q?: string }) {
  const { data } = await api.get<MyQuizzesResponse>('/me/quizzes', { params })
  return data
}

/** List my attempts for a given quiz */
export async function listMyAttempts(quizId: string) {
  const { data } = await api.get<{ items: AttemptLite[] }>(`/me/quizzes/${encodeURIComponent(quizId)}/attempts`)
  return data.items ?? []
}

/** Start an attempt (backend should enforce access, attempts limit, etc.) */
export async function startAttempt(quizId: string) {
  const { data } = await api.post<{ attempt: AttemptLite }>(`/me/quizzes/${encodeURIComponent(quizId)}/start`, {})
  return data.attempt
}

/** Get one attempt (resume or view) */
export async function getAttempt(attemptId: string) {
  const { data } = await api.get<{ attempt: AttemptLite }>(`/me/attempts/${encodeURIComponent(attemptId)}`)
  return data.attempt
}

/** Save/replace answers for an attempt (MVP shape; we’ll refine when we wire the player) */
export async function saveAttemptAnswers(attemptId: string, body: {
  // array of { questionId, selectedOptionIds? | booleanAnswer? | textAnswer? }
  answers: Array<{
    questionId: string
    selectedOptionIds?: string[]
    booleanAnswer?: boolean
    textAnswer?: string
  }>
}) {
  const { data } = await api.patch<{ ok: true }>(`/me/attempts/${encodeURIComponent(attemptId)}/answers`, body)
  return data.ok
}

/** Submit and grade */
export async function submitAttempt(attemptId: string) {
  const { data } = await api.post<{ attempt: AttemptLite & { gradedAt?: string } }>(
    `/me/attempts/${encodeURIComponent(attemptId)}/submit`,
    {}
  )
  return data.attempt
}
