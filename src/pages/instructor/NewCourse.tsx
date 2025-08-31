import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/ui/Button'
import { createDraftCourse } from '@/lib/instructorCourses.api'

type Level = 'beginner' | 'intermediate' | 'advanced'

export default function NewCourse() {
  const nav = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [level, setLevel] = useState<Level>('beginner')
  const [category, setCategory] = useState('')
  const [thumbnail, setThumbnail] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [durationSec, setDurationSec] = useState<number | ''>('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)

    if (!title.trim()) { setErr('Title is required'); return }
    if (!youtubeUrl.trim()) { setErr('YouTube URL is required'); return }

    setLoading(true)
    try {
      const course = await createDraftCourse({
        title: title.trim(),
        description: description.trim(),
        level,
        category: category.trim(),
        thumbnail: thumbnail.trim(),
        youtubeUrl: youtubeUrl.trim(),
        lessonTitle: title.trim(),
        durationSec: typeof durationSec === 'number' ? durationSec : 0,
      })
      // land on editor with PRICING tab (the editor will default to pricing)
      nav(`/instructor/courses/${course.id}`);
    } catch (e: any) {
      setErr(e?.response?.data?.message || 'Failed to create course')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto card p-6 space-y-4">
      <h2 className="text-xl font-semibold">Create a course</h2>

      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block text-sm">
          Title
          <input
            className="mt-1 w-full border rounded-md h-10 px-3"
            value={title}
            onChange={e=>setTitle(e.target.value)}
            placeholder="e.g., UCAT Mock 08"
          />
        </label>

        <label className="block text-sm">
          Description
          <textarea
            className="mt-1 w-full border rounded-md px-3 py-2 min-h-[110px]"
            value={description}
            onChange={e=>setDescription(e.target.value)}
            placeholder="What will students learn?"
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block text-sm">
            Level
            <select
              className="mt-1 w-full border rounded-md h-10 px-3"
              value={level}
              onChange={e=>setLevel(e.target.value as Level)}
            >
              <option value="beginner">beginner</option>
              <option value="intermediate">intermediate</option>
              <option value="advanced">advanced</option>
            </select>
          </label>
          <label className="block text-sm">
            Category
            <input
              className="mt-1 w-full border rounded-md h-10 px-3"
              value={category}
              onChange={e=>setCategory(e.target.value)}
              placeholder="ucat"
            />
          </label>
          <label className="block text-sm">
            Duration (sec)
            <input
              className="mt-1 w-full border rounded-md h-10 px-3"
              type="number"
              min={0}
              value={String(durationSec)}
              onChange={e=>setDurationSec(e.target.value ? Math.max(0, Number(e.target.value)) : '')}
              placeholder="0"
            />
          </label>
        </div>

        <label className="block text-sm">
          Thumbnail URL
          <input
            className="mt-1 w-full border rounded-md h-10 px-3"
            value={thumbnail}
            onChange={e=>setThumbnail(e.target.value)}
            placeholder="https://..."
          />
        </label>

        <label className="block text-sm">
          YouTube URL
          <input
            className="mt-1 w-full border rounded-md h-10 px-3"
            value={youtubeUrl}
            onChange={e=>setYoutubeUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </label>

        {err && <div className="text-sm text-red-600">{err}</div>}

        <Button disabled={loading}>{loading ? 'Creating…' : 'Create course'}</Button>
      </form>

      <p className="text-xs text-gray-600">
        You can set pricing and publish next.
      </p>
    </div>
  )
}
