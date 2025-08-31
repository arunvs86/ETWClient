import { api } from '@/lib/api'

export async function uploadImage(file: File): Promise<string> {
  const fd = new FormData()
  fd.append('file', file)
  const { data } = await api.post('/uploads', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  if (!data?.url) throw new Error('Upload failed')
  return data.url as string
}
