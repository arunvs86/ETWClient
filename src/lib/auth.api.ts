import {api , setAuthHeader} from '@/lib/api'

export type ApiUser = { id: string; name: string; email: string; role: 'student'|'instructor'|'admin'; avatar: string }

type AuthRes = { accessToken: string; user: ApiUser }

export async function me() {
  const { data } = await api.get<{ user: ApiUser }>('/auth/me')
  return data.user
}

export async function login(body: { email: string; password: string }) {
  const { data } = await api.post<AuthRes>('/auth/login', body)
  setAuthHeader(data.accessToken)
  return data.user
}

export async function register(body: { name: string; email: string; password: string }) {
  const { data } = await api.post<AuthRes>('/auth/register', body)
  setAuthHeader(data.accessToken)
  return data.user
}

export async function logout() {
  await api.post('/auth/logout')
  setAuthHeader(undefined)
}

export async function googleSignIn(idToken: string) {
  const { data } = await api.post<AuthRes>('/auth/google', { idToken })
  setAuthHeader(data.accessToken)
  return data.user
}
