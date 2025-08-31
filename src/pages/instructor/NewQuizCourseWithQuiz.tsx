import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import { createDraftCourse } from '../../lib/instructorCourses.api'
import { createSection } from '../../lib/instructorStructure.api'
import { createQuiz } from '../../lib/instructorQuizzes.api'
import { createLesson as createLessonGeneric } from '../../lib/instructorStructure.api'

type Step = 1 | 2 | 3 | 4

export default function NewQuizCourseWithQuiz() {
  const nav = useNavigate()
  const [step, setStep] = useState<Step>(1)

  // course
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [description, setDescription] = useState('')
  const [thumbnail, setThumbnail] = useState('')
  const [language, setLanguage] = useState('en')
  const [level, setLevel] = useState<'beginner'|'intermediate'|'advanced'>('beginner')
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState('')

  // quiz
  const [quizTitle, setQuizTitle] = useState('')
  const [quizDesc, setQuizDesc] = useState('')
  const [attemptsAllowed, setAttemptsAllowed] = useState(1)
  const [passPercent, setPassPercent] = useState(70)
  const [timeLimitSec, setTimeLimitSec] = useState(0) // 0 = no limit

  // ui state
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // gentle default: mirror course title/desc into quiz if left blank
  useEffect(() => {
    if (!quizTitle.trim()) setQuizTitle(title)
    if (!quizDesc.trim()) setQuizDesc(description)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description])

  const percent = useMemo(() => [0, 25, 55, 85, 100][step], [step])

  function validateStep(s: Step) {
    const fe: Record<string,string> = {}
    if (s === 1) {
      if (!title.trim()) fe.title = 'Course title is required'
      if (!language.trim()) fe.language = 'Language is required'
    }
    if (s === 2) {
      if (!quizTitle.trim()) fe.quizTitle = 'Quiz title is required'
    }
    if (s === 3) {
      if (attemptsAllowed < 1) fe.attemptsAllowed = 'Must be at least 1'
      if (passPercent < 0 || passPercent > 100) fe.passPercent = 'Must be 0–100'
      if (timeLimitSec < 0) fe.timeLimitSec = 'Must be ≥ 0'
    }
    setFieldErrors(fe)
    return Object.keys(fe).length === 0
  }

  function goNext() {
    if (!validateStep(step)) return
    setStep((prev) => (prev < 4 ? ((prev + 1) as Step) : prev))
  }

  function goBack() {
    setStep((prev) => (prev > 1 ? ((prev - 1) as Step) : prev))
  }

  async function handleCreate() {
    if (!validateStep(3)) { setStep(3); return }
    setErr(null); setMsg(null); setBusy(true)
    try {
      // 1) Course
      const course = await createDraftCourse({
        title,
        subtitle,
        description,
        language,
        level,
        category,
        tags: tags ? tags.split(',').map(s=>s.trim()).filter(Boolean) : [],
        thumbnail,
      })

      // 2) Section
      const section = await createSection(course.id, { title: 'Quiz' })

      // 3) Quiz (course-linked)
      const quiz = await createQuiz({
        courseId: course.id,
        title: quizTitle || title,
        description: quizDesc || description,
        attemptsAllowed,
        passPercent,
        timeLimitSec,
        visibility: 'enrolled',
      })

      // 4) Quiz Lesson
      await createLessonGeneric(section.id, {
        title: quiz.title,
        type: 'quiz',
        quizId: quiz.id,
      })

      setMsg('Quiz course created! Redirecting…')
      nav(`/instructor/courses/${course.id}/edit`, { state: { course } })
    } catch (e:any) {
      setErr(e?.response?.data?.message || 'Failed to create quiz course')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Create a Quiz Course</h1>
          <p className="text-sm text-gray-600">We’ll create a course, add a section, create a quiz, then attach it as a lesson.</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="mb-4 rounded-2xl border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <Steps step={step} setStep={(s)=>setStep(s)} />
        </div>
        <div className="mt-3 h-1.5 w-full rounded-full bg-gray-100">
          <div className="h-full rounded-full bg-black transition-all" style={{ width: `${percent}%` }} />
        </div>
      </div>

      {/* Alerts */}
      {err && <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}
      {msg && <div className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{msg}</div>}

      {/* Content + Summary */}
      <div className="grid gap-6 lg:grid-cols-[1fr,360px]">
        {/* Content card */}
        <section className="card p-5">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Course details</h2>
              <div className="grid gap-4 md:grid-cols-[1fr,280px]">
                <div className="space-y-4">
                  <Field label="Title" error={fieldErrors.title}>
                    <input className="input" value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g., UCAT Mini-Mock Course" />
                  </Field>
                  <Field label="Subtitle">
                    <input className="input" value={subtitle} onChange={e=>setSubtitle(e.target.value)} placeholder="Optional subtitle" />
                  </Field>
                  <Field label="Description">
                    <textarea className="input min-h-28" value={description} onChange={e=>setDescription(e.target.value)} placeholder="What’s inside this quiz course?" />
                  </Field>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Field label="Language" error={fieldErrors.language}>
                      <input className="input" value={language} onChange={e=>setLanguage(e.target.value)} />
                    </Field>
                    <Field label="Level">
                      <select className="input bg-white" value={level} onChange={e=>setLevel(e.target.value as any)}>
                        <option value="beginner">beginner</option>
                        <option value="intermediate">intermediate</option>
                        <option value="advanced">advanced</option>
                      </select>
                    </Field>
                    <Field label="Category">
                      <input className="input" value={category} onChange={e=>setCategory(e.target.value)} placeholder="e.g., ucat" />
                    </Field>
                  </div>
                  <Field label="Tags (comma-separated)">
                    <input className="input" value={tags} onChange={e=>setTags(e.target.value)} placeholder="ucat, mock, practice" />
                  </Field>
                </div>

                <div className="space-y-3">
                  <Field label="Thumbnail URL">
                    <input className="input" value={thumbnail} onChange={e=>setThumbnail(e.target.value)} placeholder="https://…" />
                  </Field>
                  <div className="aspect-video overflow-hidden rounded-lg ring-1 ring-black/5">
                    {thumbnail ? (
                      <img src={thumbnail} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-gray-500">No thumbnail</div>
                    )}
                  </div>
                </div>
              </div>
              <FooterNav onBack={null} onNext={goNext} nextDisabled={!title.trim()} />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Quiz details</h2>
              <Field label="Quiz title" error={fieldErrors.quizTitle}>
                <input className="input" value={quizTitle} onChange={e=>setQuizTitle(e.target.value)} placeholder={title || 'e.g., UCAT Mini-Mock 01'} />
              </Field>
              <Field label="Quiz description">
                <textarea className="input min-h-28" value={quizDesc} onChange={e=>setQuizDesc(e.target.value)} placeholder={description || 'A short diagnostic quiz…'} />
              </Field>
              <FooterNav onBack={goBack} onNext={goNext} />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Delivery rules</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Attempts allowed" error={fieldErrors.attemptsAllowed} note="Min 1">
                  <input type="number" min={1} className="input" value={attemptsAllowed} onChange={e=>setAttemptsAllowed(Math.max(1, Number(e.target.value)||1))} />
                </Field>
                <Field label="Pass %" error={fieldErrors.passPercent} note="0–100%">
                  <input type="number" min={0} max={100} className="input" value={passPercent} onChange={e=>setPassPercent(Math.max(0, Math.min(100, Number(e.target.value)||0)))} />
                </Field>
                <Field label="Time limit (sec)" error={fieldErrors.timeLimitSec} note="0 = unlimited">
                  <input type="number" min={0} className="input" value={timeLimitSec} onChange={e=>setTimeLimitSec(Math.max(0, Number(e.target.value)||0))} />
                </Field>
              </div>
              <FooterNav onBack={goBack} onNext={()=>setStep(4)} />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Create</h2>
              <p className="text-sm text-gray-600">We’ll create a course → section → quiz → quiz lesson.</p>
              <div className="flex items-center justify-between">
                <button className="text-sm text-gray-700" onClick={goBack} type="button">Back</button>
                <Button onClick={handleCreate} disabled={busy}>
                  {busy ? 'Creating…' : 'Create quiz course'}
                </Button>
              </div>
            </div>
          )}
        </section>

        {/* Summary card (right column) */}
        <aside className="card sticky top-6 h-fit p-5">
          <h3 className="mb-3 text-sm font-medium text-gray-700">Summary</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <div className="h-14 w-20 overflow-hidden rounded-md ring-1 ring-black/5">
                {thumbnail ? (
                  <img src={thumbnail} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-500">No image</div>
                )}
              </div>
              <div className="min-w-0">
                <div className="truncate font-medium">{title || 'Untitled course'}</div>
                <div className="truncate text-xs text-gray-500">{subtitle || '—'}</div>
              </div>
            </div>

            <div className="border-t pt-3">
              <div className="mb-1 text-xs uppercase tracking-wide text-gray-500">Quiz</div>
              <div className="font-medium">{quizTitle || 'Untitled quiz'}</div>
              <div className="mt-1 grid grid-cols-3 gap-2 text-xs">
                <Badge label="Attempts" value={`${attemptsAllowed}`} />
                <Badge label="Pass %" value={`${passPercent}%`} />
                <Badge label="Time" value={timeLimitSec ? `${timeLimitSec}s` : 'No limit'} />
              </div>
            </div>

            <div className="border-t pt-3">
              <div className="text-xs text-gray-500">Visibility</div>
              <div className="text-sm">Enrolled learners (course-linked)</div>
            </div>

            <div className="border-t pt-3 text-xs text-gray-500">
              Pricing & publishing are done after creation on the course page.
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}

/* ---------- Small UI pieces ---------- */

function Steps({ step, setStep }:{ step: Step; setStep: (s: Step)=>void }) {
  const items = [
    { n: 1 as Step, label: 'Course' },
    { n: 2 as Step, label: 'Quiz' },
    { n: 3 as Step, label: 'Rules' },
    { n: 4 as Step, label: 'Create' },
  ]
  return (
    <ol className="flex w-full items-center justify-between">
      {items.map((it, i) => {
        const active = step === it.n
        const complete = step > it.n
        return (
          <li key={it.n} className="flex min-w-0 flex-1 items-center gap-2">
            <button
              type="button"
              onClick={() => setStep(it.n)}
              className={`inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition
                ${active ? 'bg-black text-white' : complete ? 'text-black' : 'text-gray-700 hover:bg-gray-100'}
              `}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs
                  ${active ? 'bg-white text-black' : complete ? 'bg-black text-white' : 'bg-gray-200 text-gray-700'}
                `}
              >
                {it.n}
              </span>
              <span className="truncate">{it.label}</span>
            </button>
            {i < items.length - 1 && <span className="mx-2 hidden flex-1 border-t border-gray-200 sm:block" />}
          </li>
        )
      })}
    </ol>
  )
}

function Field({
  label, error, note, children,
}:{
  label: string
  error?: string
  note?: string
  children: React.ReactNode
}) {
  return (
    <label className="block text-sm">
      <div className="mb-1 flex items-center justify-between">
        <span className="font-medium text-gray-800">{label}</span>
        {note && <span className="text-xs text-gray-500">{note}</span>}
      </div>
      <div>{children}</div>
      {error && <div className="mt-1 text-xs text-red-600">{error}</div>}
    </label>
  )
}

function FooterNav({ onBack, onNext, nextDisabled }:{
  onBack: null | (()=>void)
  onNext: ()=>void
  nextDisabled?: boolean
}) {
  return (
    <div className="mt-2 flex items-center justify-between border-t pt-4">
      <div>
        {onBack ? (
          <button type="button" className="text-sm text-gray-700 hover:underline" onClick={onBack}>
            Back
          </button>
        ) : <span />}
      </div>
      <Button onClick={onNext} disabled={nextDisabled}>Next</Button>
    </div>
  )
}

function Badge({ label, value }:{ label: string; value: string }) {
  return (
    <div className="rounded-lg border px-2 py-1 text-center">
      <div className="text-[10px] uppercase tracking-wide text-gray-500">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  )
}

/* If you don't already have these utilities, you can drop them in your CSS:
.input { @apply h-10 w-full rounded-md border px-3 text-sm ring-1 ring-black/5 focus:outline-none focus:ring-2 focus:ring-black/20; }
.card  { @apply rounded-2xl border bg-white shadow-sm; }
*/
