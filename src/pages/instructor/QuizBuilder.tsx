import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import Button from '../../components/ui/Button'
import { listQuestions, createQuestion, updateQuestion, reorderQuestion, deleteQuestion, type QuizQuestion } from '../../lib/instructorQuizQuestions.api'
import { getMyQuiz } from '../../lib/instructorQuizzes.api'

type QType = 'mcq'|'multi'|'boolean'|'short'

export default function QuizBuilder(){
  const { id: quizId='' } = useParams()
  const [quiz, setQuiz] = useState<any>(null)
  const [items, setItems] = useState<QuizQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string|null>(null)

  useEffect(()=>{ (async()=>{
    try{
      setLoading(true)
      const [q, list] = await Promise.all([ getMyQuiz(quizId), listQuestions(quizId) ])
      setQuiz(q); setItems(list)
    }catch(e:any){ setErr(e?.response?.data?.message || 'Failed to load') }
    finally{ setLoading(false) }
  })() },[quizId])

  async function addSampleMCQ(){
    try{
      const next = await createQuestion(quizId, {
        type:'mcq',
        prompt:'Sample question prompt?',
        options:[{id:'A',text:'Option A'},{id:'B',text:'Option B'},{id:'C',text:'Option C'}],
        correctOptionIds:['A'],
        points:1,
      })
      setItems(prev => [...prev, next].sort((a,b)=>a.order-b.order))
    }catch(e:any){ alert(e?.response?.data?.message || 'Failed') }
  }

  return (
    <main className="container-app py-8">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{quiz?.title || 'Quiz Builder'}</h1>
          <p className="text-sm text-gray-600">{quiz?.questionCount ?? 0} questions · {quiz?.totalPoints ?? 0} pts</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={addSampleMCQ}>Add MCQ</Button>
          <AddQuestionDialog quizId={quizId} onAdd={q => setItems(prev => [...prev, q].sort((a,b)=>a.order-b.order))} />
        </div>
      </div>

      {err && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}
      {loading ? <div className="text-sm text-gray-600">Loading…</div> : (
        <div className="space-y-3">
          {items.length===0 && <div className="text-sm text-gray-600">No questions yet.</div>}
          {items.map((q, idx)=>(
            <QuestionRow key={q.id} q={q} idx={idx}
              onChange={async(patch)=>{
                const updated = await updateQuestion(q.id, patch as any)
                setItems(items.map(x=>x.id===q.id? updated : x))
              }}
              onMove={async(dir)=>{
                const target = Math.max(0, Math.min(items.length-1, idx + dir))
                if (target===idx) return
                await reorderQuestion(q.id, target)
                const cp = [...items]; const itm = cp.splice(idx,1)[0]; cp.splice(target,0,itm)
                cp.forEach((x,i)=> (x as any).order = i)
                setItems(cp)
              }}
              onDelete={async()=>{
                if (!confirm('Delete question?')) return
                await deleteQuestion(q.id)
                setItems(items.filter(x=>x.id!==q.id))
              }}
            />
          ))}
        </div>
      )}
    </main>
  )
}

function QuestionRow({ q, idx, onChange, onMove, onDelete }:{
  q: QuizQuestion; idx:number;
  onChange: (patch: Partial<QuizQuestion>)=>void|Promise<void>;
  onMove: (dir:-1|1)=>void|Promise<void>;
  onDelete: ()=>void|Promise<void>;
}){
  const [editing, setEditing] = useState(false)
  const [prompt, setPrompt] = useState(q.prompt)
  const [points, setPoints] = useState<number>('points' in q ? q.points : 1)
  const [explanation, setExplanation] = useState('explanation' in q ? (q.explanation||'') : '')

  useEffect(()=>{ setPrompt(q.prompt); if ('points' in q) setPoints(q.points); if ('explanation' in q) setExplanation(q.explanation||'') },[q])

  async function saveBasic(){
    await onChange({ prompt, points, explanation } as any)
    setEditing(false)
  }

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs text-gray-500">{idx+1}. <TypeBadge t={q.type} /></div>
          {!editing ? (
            <div className="mt-1 font-medium">{q.prompt}</div>
          ) : (
            <textarea className="input mt-1 min-h-[60px]" value={prompt} onChange={e=>setPrompt(e.target.value)} />
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="ghost" onClick={()=>onMove(-1)}>↑</Button>
          <Button variant="ghost" onClick={()=>onMove(1)}>↓</Button>
          <Button variant="ghost" onClick={()=>setEditing(!editing)}>{editing?'Cancel':'Edit'}</Button>
          {editing ? <Button onClick={saveBasic}>Save</Button> : <Button variant="ghost" onClick={onDelete}>Delete</Button>}
        </div>
      </div>

      {/* Type-specific editor */}
      <div className="mt-3">
        {q.type==='mcq' || q.type==='multi' ? (
          <MCQEditor q={q} onChange={onChange} />
        ) : q.type==='boolean' ? (
          <BooleanEditor q={q} onChange={onChange} />
        ) : (
          <ShortEditor q={q} onChange={onChange} />
        )}
      </div>

      {/* Points & explanation */}
      {editing && (
        <div className="mt-3 grid gap-3 sm:grid-cols-[120px,1fr]">
          <label className="block text-sm">Points
            <input type="number" min={0} className="input mt-1" value={points} onChange={e=>setPoints(Math.max(0, Number(e.target.value)||0))} />
          </label>
          <label className="block text-sm">Explanation (shown after submit)
            <textarea className="input mt-1 min-h-[60px]" value={explanation} onChange={e=>setExplanation(e.target.value)} />
          </label>
        </div>
      )}
    </div>
  )
}

function TypeBadge({ t }:{ t: QType }){
  const label = t==='mcq' ? 'MCQ' : t==='multi' ? 'Multiple' : t==='boolean' ? 'True/False' : 'Short'
  return <span className="rounded-full border px-2 py-0.5 text-[11px]">{label}</span>
}

function MCQEditor({ q, onChange }:{ q: Extract<QuizQuestion, {type:'mcq'|'multi'}>; onChange: (patch:any)=>void|Promise<void> }){
  const [opts, setOpts] = useState(q.options)
  const [correct, setCorrect] = useState<string[]>(q.correctOptionIds)

  useEffect(()=>{ setOpts(q.options); setCorrect(q.correctOptionIds) },[q])

  function setOpt(idx:number, text:string){
    const cp = [...opts]; cp[idx] = { ...cp[idx], text }; setOpts(cp)
  }
  function addOpt(){
    const nextId = String.fromCharCode(65 + opts.length) // A,B,C...
    setOpts([...opts, { id: nextId, text: '' }])
  }
  function removeOpt(i:number){
    const cp = opts.filter((_,idx)=>idx!==i)
    setOpts(cp)
    setCorrect(correct.filter(c => c !== opts[i].id))
  }
  function toggleCorrect(id:string){
    if (q.type==='mcq'){
      setCorrect([id])
    } else {
      setCorrect(correct.includes(id) ? correct.filter(x=>x!==id) : [...correct, id])
    }
  }
  async function save(){
    await onChange({ options: opts, correctOptionIds: correct })
  }

  return (
    <div className="space-y-2">
      {opts.map((o, i)=>(
        <div key={o.id} className="flex items-center gap-2">
          <button type="button" className={`h-8 w-8 rounded-md border ${correct.includes(o.id)?'bg-black text-white':'bg-white'}`} onClick={()=>toggleCorrect(o.id)}>
            {o.id}
          </button>
          <input className="input h-9 flex-1" value={o.text} onChange={e=>setOpt(i, e.target.value)} placeholder={`Option ${o.id}`} />
          <Button variant="ghost" onClick={()=>removeOpt(i)}>Remove</Button>
        </div>
      ))}
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={addOpt}>Add option</Button>
        <Button onClick={save}>Save options</Button>
      </div>
    </div>
  )
}

function BooleanEditor({ q, onChange }:{ q: Extract<QuizQuestion,{type:'boolean'}>; onChange: (patch:any)=>void|Promise<void> }){
  const [val, setVal] = useState<boolean>(q.correctBoolean)
  useEffect(()=>{ setVal(q.correctBoolean) },[q])
  async function save(){ await onChange({ correctBoolean: val }) }
  return (
    <div className="flex items-center gap-3">
      <select className="input w-40" value={String(val)} onChange={e=>setVal(e.target.value==='true')}>
        <option value="true">True</option>
        <option value="false">False</option>
      </select>
      <Button onClick={save}>Save</Button>
    </div>
  )
}

function ShortEditor({ q, onChange }:{ q: Extract<QuizQuestion,{type:'short'}>; onChange: (patch:any)=>void|Promise<void> }){
  const [text, setText] = useState(q.correctText.join(', '))
  useEffect(()=>{ setText(q.correctText.join(', ')) },[q])
  async function save(){ await onChange({ correctText: text.split(',').map(s=>s.trim()).filter(Boolean) }) }
  return (
    <div className="flex items-center gap-2">
      <input className="input flex-1" value={text} onChange={e=>setText(e.target.value)} placeholder="Accepted answers, comma-separated" />
      <Button onClick={save}>Save</Button>
    </div>
  )
}

function AddQuestionDialog({ quizId, onAdd }:{ quizId: string; onAdd:(q:QuizQuestion)=>void }){
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<QType>('mcq')
  const [prompt, setPrompt] = useState('')
  const [points, setPoints] = useState(1)

  async function submit(){
    if (!prompt.trim()) { alert('Prompt is required'); return }
    let created:any;
    if (type==='mcq' || type==='multi'){
      created = await createQuestion(quizId, {
        type, prompt, points,
        options:[{id:'A',text:''},{id:'B',text:''}],
        correctOptionIds: type==='mcq' ? ['A'] : ['A','B'],
      })
    } else if (type==='boolean'){
      created = await createQuestion(quizId, { type, prompt, points, correctBoolean:true })
    } else {
      created = await createQuestion(quizId, { type, prompt, points, correctText:[''] })
    }
    onAdd(created); setOpen(false); setPrompt(''); setPoints(1)
  }

  return (
    <div>
      {!open ? (
        <Button variant="secondary" onClick={()=>setOpen(true)}>New Question</Button>
      ) : (
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-[160px,1fr,120px]">
            <select className="input" value={type} onChange={e=>setType(e.target.value as QType)}>
              <option value="mcq">MCQ (single)</option>
              <option value="multi">Multiple select</option>
              <option value="boolean">True/False</option>
              <option value="short">Short text</option>
            </select>
            <input className="input" placeholder="Question prompt…" value={prompt} onChange={e=>setPrompt(e.target.value)} />
            <input className="input" type="number" min={0} value={points} onChange={e=>setPoints(Math.max(0, Number(e.target.value)||0))} />
          </div>
          <div className="mt-3 flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={()=>setOpen(false)}>Cancel</Button>
            <Button onClick={submit}>Add</Button>
          </div>
        </div>
      )}
    </div>
  )
}
