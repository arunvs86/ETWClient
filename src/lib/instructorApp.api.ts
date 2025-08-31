import { api } from '@/lib/api'

export type InstructorAppStatus = 'pending' | 'approved' | 'rejected'

export type InstructorApplication = {
  id: string
  status: InstructorAppStatus
  answers: {
    displayName: string
    bio: string
    website?: string
    links?: string[]
    categories?: string[]
    samples?: string[]
    agreeTerms: boolean
  }
  review?: {
    reason?: string
    reviewedBy?: string
    reviewedAt?: string
    notes?: string
  }
  createdAt: string
  updatedAt: string
}

export type ApplyPayload = {
  displayName: string
  bio: string
  website?: string
  links?: string[] | string
  categories?: string[] | string
  samples?: string[] | string
  agreeTerms: boolean
}

export async function applyInstructor(payload: ApplyPayload) {
  const { data } = await api.post<{ application: InstructorApplication }>('/me/instructor/apply', payload)
  return data.application
}

export async function getMyInstructorApplication() {
  const { data } = await api.get<{ application: InstructorApplication | null }>('/me/instructor/application')
  return data.application
}

/* ---- Admin (next slice; included for completeness) ---- */
export async function adminListApplications(params: { status?: InstructorAppStatus; q?: string; page?: number; limit?: number }) {
  const { data } = await api.get<{ items: any[]; meta: any }>('/admin/instructor-applications', { params })
  return data
}
export async function adminGetApplication(id: string) {
  const { data } = await api.get<{ application: InstructorApplication }>(`/admin/instructor-applications/${id}`)
  return data.application
}
export async function adminApproveApplication(id: string) {
  const { data } = await api.post<{ ok: true; application: { id: string; status: InstructorAppStatus } }>(
    `/admin/instructor-applications/${id}/approve`
  )
  return data.application
}
export async function adminRejectApplication(id: string, reason: string) {
  const { data } = await api.post<{ ok: true; application: InstructorApplication }>(
    `/admin/instructor-applications/${id}/reject`,
    { reason }
  )
  return data.application
}
export async function adminUpdateAppNotes(id: string, notes: string) {
  const { data } = await api.patch<{ application: InstructorApplication }>(
    `/admin/instructor-applications/${id}/notes`,
    { notes }
  )
  return data.application
}
