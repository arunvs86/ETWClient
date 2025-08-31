import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  createQuiz, getMyQuiz, updateQuizBasics,
  publishQuiz, unpublishQuiz, deleteQuiz, type InstructorQuiz
} from '@/lib/instructorQuizzes.api'

export default function QuizUpsertPage() {
  const { id } = useParams<{ id: string }>()
  const isNew = !id || id === 'new'
  const nav = useNavigate()

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [quiz, setQuiz] = useState<InstructorQuiz | null>(null)
  const [err, setErr] = useState<string | null>(null)

  // form
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [attemptsAllowed, setAttemptsAllowed] = useState(1)
  const [passPercent, setPassPercent] = useState(70)
  const [timeLimitSec, setTimeLimitSec] = useState(0)
  const [visibility, setVisibility] = useState<'enrolled'|'public'>('enrolled')
  const [shuffleQuestions, setShuffleQuestions] = useState(false)
  const [shuffleOptions, setShuffleOptions] = useState(false)

  useEffect(() => {
    if (!isNew) {
      (async () => {
        try {
          setLoading(true)
          const q = await getMyQuiz(id!)
          setQuiz(q)
          setTitle(q.title || '')
          setDescription(q.description || '')
          setAttemptsAllowed(q.attemptsAllowed || 1)
          setPassPercent(q.passPercent || 70)
          setTimeLimitSec(q.timeLimitSec || 0)
          setVisibility(q.visibility || 'enrolled')
          setShuffleQuestions(!!q.shuffleQuestions)
          setShuffleOptions(!!q.shuffleOptions)
        } catch (e: any) {
          setErr(e?.response?.data?.message || 'Failed to load quiz')
        } finally {
          setLoading(false)
        }
      })()
    }
  }, [isNew, id])

  async function onCreate() {
    setSaving(true); setErr(null)
    try {
      const created = await createQuiz({
        title, description, attemptsAllowed, passPercent, timeLimitSec,
        visibility, shuffleQuestions, shuffleOptions,
      })
      nav(`/instructor/quizzes/${created.id}`)
    } catch (e:any) {
      setErr(e?.response?.data?.message || 'Failed to create')
    } finally { setSaving(false) }
  }

  async function onSave() {
    if (!quiz) return
    setSaving(true); setErr(null)
    try {
      const updated = await updateQuizBasics(quiz.id, {
        title, description, attemptsAllowed, passPercent, timeLimitSec,
        visibility, shuffleQuestions, shuffleOptions,
      })
      setQuiz(updated)
    } catch (e:any) {
      setErr(e?.response?.data?.message || 'Failed to save')
    } finally { setSaving(false) }
  }

  async function onPublish() {
    if (!quiz) return
    setSaving(true); setErr(null)
    try {
      const updated = await publishQuiz(quiz.id)
      setQuiz(updated)
    } catch (e:any) {
      setErr(e?.response?.data?.message || 'Publish failed')
    } finally { setSaving(false) }
  }

  async function onUnpublish() {
    if (!quiz) return
    setSaving(true); setErr(null)
    try {
      const updated = await unpublishQuiz(quiz.id)
      setQuiz(updated)
    } catch (e:any) {
      setErr(e?.response?.data?.message || 'Unpublish failed')
    } finally { setSaving(false) }
  }

  async function onDelete() {
    if (!quiz) return
    if (!confirm('Delete this quiz? (only if unpublished and no attempts)')) return
    setSaving(true); setErr(null)
    try {
      await deleteQuiz(quiz.id)
      nav('/instructor/quizzes')
    } catch (e:any) {
      setErr(e?.response?.data?.message || 'Delete failed')
    } finally { setSaving(false) }
  }

  return (
    <main className="mx-auto max-w-3xl p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{isNew ? 'New Quiz' : (quiz?.title || 'Edit Quiz')}</h1>
        {!isNew && (
          <div className="flex gap-2">
            <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${quiz?.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {quiz?.isPublished ? 'Published' : 'Unpublished'}
            </span>
            <a className="rounded-md border px-3 py-1.5 text-sm" href={`/quizzes/${quiz?.slug}`} target="_blank" rel="noreferrer">View</a>
          </div>
        )}
      </div>

      {err && <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}
      {loading ? (
        <div className="h-32 animate-pulse rounded-lg bg-gray-100" />
      ) : (
        <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-4">
          <label className="block text-sm">
            <div className="mb-1 font-medium text-gray-800">Title</div>
            <input className="input" value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g., Ucat Mock" />
          </label>

          <label className="block text-sm">
            <div className="mb-1 font-medium text-gray-800">Description</div>
            <textarea className="input min-h-28" value={description} onChange={e=>setDescription(e.target.value)} placeholder="Short summary…" />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">Attempts allowed
              <input type="number" min={1} className="input ml-2 mt-1" value={attemptsAllowed} onChange={e=>setAttemptsAllowed(Math.max(1, Number(e.target.value)||1))} />
            </label>
            <label className="block text-sm">Pass %
              <input type="number" min={0} max={100} className="input ml-2 mt-1" value={passPercent} onChange={e=>setPassPercent(Math.max(0, Math.min(100, Number(e.target.value)||0)))} />
            </label>
            <label className="block text-sm">Time limit (sec)
              <input type="number" min={0} className="input ml-2 mt-1" value={timeLimitSec} onChange={e=>setTimeLimitSec(Math.max(0, Number(e.target.value)||0))} />
            </label>
            <label className="block text-sm">Visibility
              <select className="input ml-2 mt-1 bg-white" value={visibility} onChange={e=>setVisibility(e.target.value as any)}>
                <option value="enrolled">logged-in only</option>
                <option value="public">public</option>
              </select>
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={shuffleQuestions} onChange={e=>setShuffleQuestions(e.target.checked)} />
              Shuffle question order
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={shuffleOptions} onChange={e=>setShuffleOptions(e.target.checked)} />
              Shuffle options
            </label>
          </div>

          <div className="flex items-center justify-between border-t pt-4">
            <div className="flex gap-2">
              {!isNew && (
                <>
                  {!quiz?.isPublished ? (
                    <button onClick={onPublish} disabled={saving} className="rounded-md bg-black px-4 py-2 text-sm text-white">Publish</button>
                  ) : (
                    <button onClick={onUnpublish} disabled={saving} className="rounded-md border px-4 py-2 text-sm">Unpublish</button>
                  )}
                  <button onClick={onDelete} disabled={saving} className="rounded-md border px-4 py-2 text-sm text-red-600">Delete</button>
                </>
              )}
            </div>
            {isNew ? (
              <button onClick={onCreate} disabled={saving || !title.trim()} className="rounded-md bg-primary px-4 py-2 text-sm text-white">
                {saving ? 'Creating…' : 'Create quiz'}
              </button>
            ) : (
              <button onClick={onSave} disabled={saving} className="rounded-md bg-primary px-4 py-2 text-sm text-white">
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            )}
          </div>
        </div>
      )}

      {!isNew && (
        <div className="mt-6">
          <a href={`/instructor/quizzes/${id}/questions`} className="rounded-md border px-4 py-2 text-sm">Open Question Builder →</a>
        </div>
      )}
    </main>
  )
}
