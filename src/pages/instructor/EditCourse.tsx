import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/ui/Button'
import type { InstructorCourse } from '../../lib/instructorCourses.api'
import {
  updateCourseBasics, updateCoursePricing,
  publishCourse, unpublishCourse, archiveCourse, restoreCourse, deleteCourse
} from '../../lib/instructorCourses.api'

import type { Section, Lesson } from '../../lib/instructorStructure.api'
import {
  getCurriculum,
  createSection, updateSection, reorderSection, deleteSection,
  createLesson, updateLesson, reorderLesson, deleteLesson
} from '../../lib/instructorStructure.api'

type TabKey = 'basics' | 'structure' | 'pricing' | 'publish';

export default function EditCourse() {
  const { id = '' } = useParams()
  const nav = useNavigate()
  const loc = useLocation() as any

  const initialCourse = (loc.state?.course as InstructorCourse) || null
  const justCreated = Boolean(loc.state?.justCreated) || new URLSearchParams(window.location.search).has('new')

  // local course state (no GET endpoint here)
  const [course, setCourse] = useState<InstructorCourse | null>(initialCourse)
  const [tab, setTab] = useState<TabKey>(justCreated ? 'structure' : 'basics')

  // structure state
  const [sections, setSections] = useState<Section[]>([])
  const [lessonsBySection, setLessonsBySection] = useState<Record<string, Lesson[]>>({})

  useEffect(() => {
    if (!course) {
      // If user refreshed, we still allow editing with empty fields.
      setCourse({ id, slug: '', status: 'draft' } as InstructorCourse)
    }
  }, [id, course])

  const statusChip = useMemo(() => {
    const s = course?.status || 'draft'
    const cls = s === 'published' ? 'bg-accent text-white' : s === 'archived' ? 'bg-warning text-white' : 'bg-muted/60 text-primary'
    return <span className={`inline-block text-xs px-2 py-1 rounded ${cls}`}>{s}</span>
  }, [course?.status])

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{course?.title || 'Edit course'}</h2>
          <div className="text-sm text-gray-600">ID: {id} · {statusChip}</div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => nav('/courses')}>View catalog</Button>
        </div>
      </header>

      {/* ✅ Reordered tabs */}
      <nav className="flex gap-2">
        {(['basics','structure','pricing','publish'] as TabKey[]).map(t => (
          <button
            key={t}
            className={`px-3 py-2 rounded-md border ${tab===t ? 'bg-primary text-white border-primary' : 'bg-surface border-border'}`}
            onClick={()=>setTab(t)}
          >
            {t[0].toUpperCase()+t.slice(1)}
          </button>
        ))}
      </nav>

      {tab === 'basics' && <BasicsTab id={id} course={course} onChange={setCourse} />}
      {tab === 'structure' && (
        <StructureTab
          courseId={id}
          sections={sections}
          setSections={setSections}
          lessonsBySection={lessonsBySection}
          setLessonsBySection={setLessonsBySection}
        />
      )}
      {tab === 'pricing' && <PricingTab id={id} course={course} onChange={setCourse} />}
      {tab === 'publish' && <PublishTab id={id} course={course} onChange={setCourse} onDeleted={()=>nav('/instructor/new')} />}
    </div>
  )
}

/* -------------------- Basics -------------------- */
function BasicsTab({ id, course, onChange }:{
  id: string
  course: InstructorCourse | null
  onChange: (c: InstructorCourse)=>void
}) {
  const [title, setTitle] = useState(course?.title || '')
  const [subtitle, setSubtitle] = useState(course?.subtitle || '')
  const [description, setDescription] = useState(course?.description || '')
  const [language, setLanguage] = useState(course?.language || 'en')
  const [level, setLevel] = useState(course?.level || 'beginner')
  const [category, setCategory] = useState(course?.category || '')
  const [tags, setTags] = useState((course?.tags || []).join(', '))
  const [thumbnail, setThumbnail] = useState(course?.thumbnail || '')
  const [promoVideoUrl, setPromoVideoUrl] = useState(course?.promoVideoUrl || '')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  async function onSave(e: React.FormEvent) {
    e.preventDefault()
    setErr(null); setMsg(null); setSaving(true)
    try {
      const updated = await updateCourseBasics(id, {
        title, subtitle, description, language, level, category,
        tags: tags.split(',').map(s=>s.trim()).filter(Boolean),
        thumbnail, promoVideoUrl
      })
      onChange(updated)
      setMsg('Saved')
    } catch (e:any) {
      setErr(e?.response?.data?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={onSave} className="card p-6 space-y-3">
      <div className="grid md:grid-cols-[1fr,300px] gap-6">
        <div className="space-y-3">
          <label className="block text-sm">Title
            <input className="mt-1 w-full border border-border rounded-md h-10 px-3" value={title} onChange={e=>setTitle(e.target.value)} />
          </label>
          <label className="block text-sm">Subtitle
            <input className="mt-1 w-full border border-border rounded-md h-10 px-3" value={subtitle} onChange={e=>setSubtitle(e.target.value)} />
          </label>
          <label className="block text-sm">Description
            <textarea className="mt-1 w-full border border-border rounded-md px-3 py-2 min-h-[120px]" value={description} onChange={e=>setDescription(e.target.value)} />
          </label>
          <div className="grid sm:grid-cols-3 gap-3">
            <label className="block text-sm">Language
              <input className="mt-1 w-full border border-border rounded-md h-10 px-3" value={language} onChange={e=>setLanguage(e.target.value)} />
            </label>
            <label className="block text-sm">Level
              <select className="mt-1 w-full border border-border rounded-md h-10 px-3 bg-surface" value={level} onChange={e=>setLevel(e.target.value as any)}>
                <option value="beginner">beginner</option>
                <option value="intermediate">intermediate</option>
                <option value="advanced">advanced</option>
              </select>
            </label>
            <label className="block text-sm">Category
              <input className="mt-1 w-full border border-border rounded-md h-10 px-3" value={category} onChange={e=>setCategory(e.target.value)} />
            </label>
          </div>
          <label className="block text-sm">Tags (comma separated)
            <input className="mt-1 w-full border border-border rounded-md h-10 px-3" value={tags} onChange={e=>setTags(e.target.value)} />
          </label>
          <label className="block text-sm">Promo video URL
            <input className="mt-1 w-full border border-border rounded-md h-10 px-3" value={promoVideoUrl} onChange={e=>setPromoVideoUrl(e.target.value)} />
          </label>
          <div className="flex items-center gap-2">
            <Button disabled={saving}>{saving ? 'Saving…' : 'Save basics'}</Button>
            {msg && <span className="text-sm text-accent">{msg}</span>}
            {err && <span className="text-sm text-red-600">{err}</span>}
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-sm">Thumbnail URL
            <input className="mt-1 w-full border border-border rounded-md h-10 px-3" value={thumbnail} onChange={e=>setThumbnail(e.target.value)} />
          </label>
          <div className="aspect-video bg-primary/10 rounded-md overflow-hidden">
            {thumbnail ? <img src={thumbnail} className="w-full h-full object-cover" /> : null}
          </div>
        </div>
      </div>
    </form>
  )
}

/* -------------------- Structure -------------------- */
function StructureTab({
  courseId, sections, setSections, lessonsBySection, setLessonsBySection
}:{
  courseId: string
  sections: Section[]
  setSections: (s: Section[]) => void
  lessonsBySection: Record<string, Lesson[]>
  setLessonsBySection: (m: Record<string, Lesson[]>) => void
}) {
  const nav = useNavigate()
  const [title, setTitle] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch DB curriculum so UI = source of truth
  useEffect(() => {
    (async () => {
      setErr(null); setLoading(true)
      try {
        const data = await getCurriculum(courseId)
        const secs = data.sections.map(s => ({ id: s.id, courseId: s.courseId, title: s.title, order: s.order }))
        const map: Record<string, Lesson[]> = {}
        for (const s of data.sections) map[s.id] = (s.lessons || []) as unknown as Lesson[]
        setSections(secs.sort((a,b)=>a.order-b.order))
        setLessonsBySection(map)
      } catch (e:any) {
        setErr(e?.response?.data?.message || 'Failed to load curriculum')
      } finally {
        setLoading(false)
      }
    })()
  }, [courseId])

  async function addSection() {
    setErr(null)
    if (!title.trim()) { setErr('Section title is required'); return }
    const s = await createSection(courseId, { title })
    const next = [...sections, s].sort((a,b)=>a.order-b.order)
    setSections(next)
    setLessonsBySection({ ...lessonsBySection, [s.id]: [] })
    setTitle('')
  }

  async function renameSection(s: Section, newTitle: string) {
    const updated = await updateSection(s.id, { title: newTitle })
    setSections(sections.map(x => x.id === s.id ? { ...x, title: updated.title } : x))
  }

  async function moveSection(s: Section, dir: -1|1) {
    const target = Math.max(0, Math.min(sections.length-1, s.order + dir))
    if (target === s.order) return
    await reorderSection(s.id, target)
    const copy = [...sections]
    const from = copy.findIndex(x => x.id === s.id)
    const item = copy.splice(from, 1)[0]
    copy.splice(target, 0, item)
    copy.forEach((x, i) => x.order = i)
    setSections(copy)
  }

  async function removeSection(s: Section) {
    if (!confirm('Delete this section (and its lessons)?')) return
    await deleteSection(s.id)
    const next = sections.filter(x => x.id !== s.id)
    const obj = { ...lessonsBySection }
    delete obj[s.id]
    setSections(next)
    setLessonsBySection(obj)
  }

  return (
    <div className="space-y-4">
      {/* <div className="card p-4 flex flex-col sm:flex-row gap-2 items-start">
        <input className="h-10 border border-border rounded-md px-3 flex-1" placeholder="New section title" value={title} onChange={e=>setTitle(e.target.value)} />
        <div className="flex gap-2">
          <Button onClick={addSection}>Add section</Button>
          <Button variant="ghost" onClick={() => window.location.reload()}>Refresh</Button>
        </div>
        {err && <div className="text-sm text-red-600">{err}</div>}
      </div> */}

      {loading ? (
        <div className="text-gray-600">Loading curriculum…</div>
      ) : (
        <div className="space-y-3">
          {sections.length === 0 && (
            <div className="text-gray-600">No sections yet. Add your first section to start uploading lessons.</div>
          )}
          {sections.map((s) => (
            <SectionBlock key={s.id}
              section={s}
              onRename={(t)=>renameSection(s,t)}
              onMove={(d)=>moveSection(s,d)}
              onDelete={()=>removeSection(s)}
              lessons={lessonsBySection[s.id] || []}
              setLessons={(ls)=>setLessonsBySection({ ...lessonsBySection, [s.id]: ls })}
              nav={nav}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function SectionBlock({
  section, onRename, onMove, onDelete, lessons, setLessons, nav
}:{
  section: Section
  onRename: (title: string)=>void
  onMove: (dir: -1|1)=>void
  onDelete: ()=>void
  lessons: Lesson[]
  setLessons: (ls: Lesson[])=>void
  nav: ReturnType<typeof useNavigate>
}) {
  const [editTitle, setEditTitle] = useState(section.title)
  const [ltitle, setLTitle] = useState('')
  const [lurl, setLUrl] = useState('')
  const [ldur, setLDur] = useState<number | ''>('')

  async function addVideoLesson() {
    if (!ltitle.trim()) return
    const lesson = await createLesson(section.id, {
      title: ltitle,
      type: 'video',
      video: { url: lurl, durationSec: Number(ldur)||0 }
    })
    const next = [...lessons, lesson].sort((a,b)=>a.order-b.order)
    setLessons(next)
    setLTitle(''); setLUrl(''); setLDur('')
  }

  async function moveLesson(lesson: Lesson, dir: -1|1) {
    const idx = lessons.findIndex(l => l.id === lesson.id)
    const target = Math.max(0, Math.min(lessons.length-1, idx + dir))
    if (target === idx) return
    await reorderLesson(lesson.id, target)
    const copy = [...lessons]
    const item = copy.splice(idx, 1)[0]
    copy.splice(target, 0, item)
    copy.forEach((l,i)=>l.order = i)
    setLessons(copy)
  }

  async function removeLesson(lesson: Lesson) {
    if (!confirm('Delete this lesson?')) return
    await deleteLesson(lesson.id)
    setLessons(lessons.filter(l => l.id !== lesson.id))
  }

  return (
    <div className="card p-4 space-y-3">
      {/* <div className="flex items-center gap-2">
        <input className="h-10 border border-border rounded-md px-3 flex-1" value={editTitle} onChange={e=>setEditTitle(e.target.value)} />
        <Button variant="ghost" onClick={()=>onRename(editTitle)}>Rename</Button>
        <Button variant="ghost" onClick={()=>onMove(-1)}>↑</Button>
        <Button variant="ghost" onClick={()=>onMove(1)}>↓</Button>
        <Button variant="ghost" onClick={onDelete}>Delete</Button>
      </div> */}

      <div className="border-t border-border pt-3 space-y-2">
        <div className="font-medium">Add video lesson</div>
        <div className="grid md:grid-cols-4 gap-2">
          <input className="h-10 border border-border rounded-md px-3" placeholder="Lesson title" value={ltitle} onChange={e=>setLTitle(e.target.value)} />
          <input className="h-10 border border-border rounded-md px-3" placeholder="Video URL or asset ref" value={lurl} onChange={e=>setLUrl(e.target.value)} />
          <input className="h-10 border border-border rounded-md px-3" type="number" placeholder="Duration (sec)" value={ldur} onChange={e=>setLDur(e.target.value ? Number(e.target.value) : '')} />
          <Button onClick={addVideoLesson}>Add lesson</Button>
        </div>
      </div>

      {lessons.length > 0 && (
        <div className="space-y-2">
          {lessons.map((l) => (
            <div key={l.id} className="flex flex-col md:flex-row items-center gap-2 border border-border rounded-md p-2">
              <div className="text-sm flex-1">
                <div className="font-medium">{l.title}</div>
                <div className="text-gray-600 text-xs">
                  {l.type === 'video' ? `Video · ${l.video?.durationSec || 0}s` :
                   l.type === 'quiz' ? 'Quiz lesson' : 'Text'}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {l.type === 'quiz' && (
                  <Button variant="secondary" onClick={()=> nav(`/instructor/quizzes/${(l as any).quizId}/builder`)}>
                    Manage questions
                  </Button>
                )}
                <Button variant="ghost" onClick={()=>moveLesson(l,-1)}>↑</Button>
                <Button variant="ghost" onClick={()=>moveLesson(l,1)}>↓</Button>
                <Button variant="ghost" onClick={()=>removeLesson(l)}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* -------------------- Pricing -------------------- */
function PricingTab({ id, course, onChange }:{
  id: string
  course: InstructorCourse | null
  onChange: (c: InstructorCourse)=>void
}) {
  const [amountMajor, setAmountMajor] = useState(
    typeof course?.pricing?.amountMinor === 'number' ? String(course!.pricing!.amountMinor / 100) : '0'
  )
  const [currency, setCurrency] = useState(course?.pricing?.currency || 'GBP')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  async function onSave(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null); setErr(null); setSaving(true)
    try {
      const updated = await updateCoursePricing(id, { amountMajor: Number(amountMajor), currency: currency as any })
      onChange({ ...(course||{ id, slug:'', status:'draft' }), pricing: updated.pricing, updatedAt: updated.updatedAt })
      setMsg('Pricing saved')
    } catch (e:any) {
      setErr(e?.response?.data?.message || 'Failed to save pricing')
    } finally {
      setSaving(false)
    }
  }

  const isFree = (Number(amountMajor) || 0) === 0

  return (
    <form onSubmit={onSave} className="card p-6 space-y-3 max-w-xl">
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="block text-sm">Price (major)
          <input className="mt-1 w-full border border-border rounded-md h-10 px-3" type="number" min="0" step="0.01" value={amountMajor} onChange={e=>setAmountMajor(e.target.value)} />
        </label>
        <label className="block text-sm">Currency
          <select className="mt-1 w-full border border-border rounded-md h-10 px-3 bg-surface" value={currency} onChange={e=>setCurrency(e.target.value)}>
            <option>GBP</option><option>USD</option><option>EUR</option>
          </select>
        </label>
      </div>
      <div className="text-sm text-gray-600">{isFree ? 'This course will be Free.' : 'This course will require membership/purchase.'}</div>
      <div className="flex items-center gap-2">
        <Button disabled={saving}>{saving ? 'Saving…' : 'Save pricing'}</Button>
        {msg && <span className="text-sm text-accent">{msg}</span>}
        {err && <span className="text-sm text-red-600">{err}</span>}
      </div>
    </form>
  )
}

/* -------------------- Publish -------------------- */
function PublishTab({ id, course, onChange, onDeleted }:{
  id: string
  course: InstructorCourse | null
  onChange: (c: InstructorCourse)=>void
  onDeleted: () => void
}) {
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const status = course?.status || 'draft'

  async function wrap(action: ()=>Promise<any>, okMsg: string) {
    setMsg(null); setErr(null)
    try {
      const c = await action()
      onChange({ ...(course||{ id, slug:'', status:'draft' }), ...c })
      setMsg(okMsg)
    } catch (e:any) {
      setErr(e?.response?.data?.message || 'Action failed')
    }
  }

  return (
    <div className="card p-6 space-y-4">
      <div className="text-sm text-gray-700">Current status: <b>{status}</b>{course?.publishedAt ? ` · Published at ${new Date(course.publishedAt).toLocaleString()}` : ''}</div>
      <div className="flex flex-wrap gap-2">
        <Button onClick={()=>wrap(()=>publishCourse(id), 'Published')}>Publish</Button>
        <Button variant="ghost" onClick={()=>wrap(()=>unpublishCourse(id), 'Unpublished')}>Unpublish</Button>
        <Button variant="secondary" onClick={()=>wrap(()=>archiveCourse(id), 'Archived')}>Archive</Button>
        <Button variant="ghost" onClick={()=>wrap(()=>restoreCourse(id), 'Restored to draft')}>Restore</Button>
      </div>
      <div className="border-t border-border pt-4">
        <div className="text-sm text-gray-700 mb-2">Danger zone</div>
        <Button variant="ghost" onClick={async()=>{
          if (!confirm('Delete draft? This cannot be undone.')) return
          try {
            const ok = await deleteCourse(id)
            if (ok) onDeleted()
          } catch (e:any) {
            setErr(e?.response?.data?.message || 'Delete failed')
          }
        }}>Delete draft</Button>
      </div>
      {msg && <div className="text-sm text-accent">{msg}</div>}
      {err && <div className="text-sm text-red-600">{err}</div>}
    </div>
  )
}
