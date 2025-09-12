import { api } from '@/lib/api'

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
  slug: string
  updatedAt?: string
}

export type MyAttemptsResp = {
  items: Array<AttemptLite & { quiz: QuizLite }>
  meta: { page: number; limit: number; total: number; hasNextPage: boolean }
}

/** List ALL my attempts (paginated, optional q = quiz title search) */
export async function listMyAttemptsAll(params?: { page?: number; limit?: number; q?: string }) {
  const { data } = await api.get<MyAttemptsResp>('/api/me/attempts', { params })
  return data
}

/** (Optional) Attempts for a single quiz by slug */
export async function listMyAttemptsBySlug(slug: string) {
  const { data } = await api.get<{ quiz: QuizLite; items: AttemptLite[] }>(`/api/me/quizzes/${encodeURIComponent(slug)}/attempts`)
  return data
}
