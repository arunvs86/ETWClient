// import { useEffect, useMemo, useRef, useState } from 'react'
// import { useParams } from 'react-router-dom'
// import Button from '@/components/ui/Button'
// import { uploadImage } from '@/lib/upload.api'
// import {
//   listQuestions, createQuestion, updateQuestion, reorderQuestion, deleteQuestion, type QuizQuestion
// } from '@/lib/instructorQuizQuestions.api'
// import { getMyQuiz, publishQuiz, unpublishQuiz, updateQuizBasics } from '@/lib/instructorQuizzes.api'
// import AutoGrowTextArea from "@/components/ui/AutoGrowTextArea";
// import { useFlushableDebounce } from "@/hooks/useFlushableDebounce";

// type QType = 'mcq'|'multi'|'boolean'|'short'
// type Media = { kind:'image'; url:string; alt?:string }
// type AnyQuestion = QuizQuestion & { media?: Media[]; options?: Array<{ id:string; text:string; media?: Media[] }> }

// /* ----------------- small utilities ----------------- */
// function useDebouncedCallback<T extends any[]>(fn:(...a:T)=>void, delay=600){
//   const t = useRef<ReturnType<typeof setTimeout>|null>(null)
//   return (...args:T)=>{
//     if (t.current) clearTimeout(t.current)
//     t.current = setTimeout(()=>fn(...args), delay)
//   }
// }
// function describeError(e:any){
//   const code = e?.response?.status
//   const msg  = e?.response?.data?.message || e?.message || 'Request failed'
//   return code ? `${code} • ${msg}` : msg
// }
// function promptPlaceholder(t:QType){
//   if (t==='mcq') return 'Which option BEST fits? Add relevant stem details above (image optional).'
//   if (t==='multi') return 'Select ALL that apply. Add relevant stem and constraints.'
//   if (t==='boolean') return 'This statement is true or false.'
//   return 'Brief, case-relevant short answer (exact match).'
// }
// function defaultPrompt(t:QType){
//   if (t==='mcq') return 'Single-correct question'
//   if (t==='multi') return 'Multi-select question'
//   if (t==='boolean') return 'This statement is true or false'
//   return 'Short answer question'
// }
// function reorderLocal<T extends {id:string}>(arr:T[], from:number, to:number){
//   if (from===to) return arr
//   const cp=[...arr]; const it=cp.splice(from,1)[0]; cp.splice(to,0,it)
//   return cp.map((x:any, i)=>({ ...x, order:i }))
// }
// const sumPoints = (list: AnyQuestion[]) => list.reduce((s,q)=> s+(q.points||0), 0)

// /* =================================================== */

// export default function QuestionStudio() {
//   const { id: quizId='' } = useParams()

//   const [quiz, setQuiz] = useState<any>(null)
//   const [items, setItems] = useState<AnyQuestion[]>([])
//   const [loading, setLoading] = useState(true)
//   const [err, setErr] = useState<string|null>(null)

//   const [selId, setSelId] = useState<string|null>(null)
//   const selected = useMemo(()=> items.find(q=>q.id===selId) || null, [items, selId])

//   // ordering & dirty
//   const [orderBaseline, setOrderBaseline] = useState<string[]>([])
//   const [draftIds, setDraftIds] = useState<Set<string>>(new Set()) // which questions have queued autosave
//   const dirty = useMemo(()=>{
//     if (orderBaseline.length !== items.length) return true
//     if (items.some((q,i)=>q.id !== orderBaseline[i])) return true
//     return draftIds.size > 0
//   },[items, orderBaseline, draftIds])

//   // DnD
//   const dragFrom = useRef<number|null>(null)
//   const [dragOver, setDragOver] = useState<number|null>(null)

//   // “Add question” type select
//   const [addType, setAddType] = useState<QType>('mcq')
  
//   const hasDrafts = draftIds.size > 0;

//   useEffect(()=>{ (async()=>{
//     try {
//       setLoading(true); setErr(null)
//       const [q, list] = await Promise.all([ getMyQuiz(quizId), listQuestions(quizId) ])
//       setQuiz(q); setItems(list as AnyQuestion[])
//       setOrderBaseline(list.map(x=>x.id))
//       if (!selId && list.length) setSelId(list[0].id)
//     } catch(e:any){ setErr(describeError(e)) }
//     finally { setLoading(false) }
//   })() },[quizId])

//   // leave guard
//   useEffect(()=>{
//     const h = (e: BeforeUnloadEvent) => { if(dirty){ e.preventDefault(); e.returnValue='' } }
//     window.addEventListener('beforeunload', h)
//     return ()=> window.removeEventListener('beforeunload', h)
//   },[dirty])

//   async function refresh(selectId?:string){
//     const list = await listQuestions(quizId)
//     setItems(list as AnyQuestion[])
//     setOrderBaseline(list.map(x=>x.id))
//     if (selectId) setSelId(selectId)
//     else if (!selId && list.length) setSelId(list[0].id)
//   }

//   /* ---------- header actions ---------- */
//   async function saveAll(){
//     try{
//       // persist ordering
//       const want = items.map(x=>x.id)
//       if (want.join('|') !== orderBaseline.join('|')){
//         for (let i=0;i<want.length;i++){
//           if (orderBaseline[i] !== want[i]) await reorderQuestion(want[i], i)
//         }
//         setOrderBaseline(want)
//       }
//       // flush any drafts by forcing a refresh (autS saves already fired)
//       setDraftIds(new Set())
//       await refresh()
//     }catch(e:any){
//       alert(describeError(e))
//       await refresh()
//     }
//   }
//   async function doPublish(){
//     if (items.length<1) return alert('Add at least one question before publishing.')
//     if (dirty) await saveAll()
//     const q = await publishQuiz(quizId); setQuiz(q); alert('Published')
//   }
//   async function doUnpublish(){
//     if (dirty) await saveAll()
//     const q = await unpublishQuiz(quizId); setQuiz(q); alert('Unpublished')
//   }
//   async function updateSettings(patch: { attemptsAllowed?:number; passPercent?:number; timeLimitMin?:number; visibility?:'public'|'enrolled' }){
//     const body:any = {}
//     if (patch.attemptsAllowed!=null) body.attemptsAllowed = Math.max(1, patch.attemptsAllowed)
//     if (patch.passPercent!=null) body.passPercent = Math.max(0, Math.min(100, patch.passPercent))
//     if (patch.timeLimitMin!=null) body.timeLimitSec = Math.max(0, patch.timeLimitMin * 60) // minutes → seconds
//     if (patch.visibility) body.visibility = patch.visibility
//     const updated = await updateQuizBasics(quizId, body)
//     setQuiz(updated)
//   }

//   /* ---------- add question (no modal) ---------- */
//   async function quickAddQuestion(type: QType){
//     try{
//       let created:any
//       if (type==='mcq' || type==='multi'){
//         created = await createQuestion(quizId, {
//           type, prompt: defaultPrompt(type), points:1,
//           options:[{id:'A',text:'Option A'},{id:'B',text:'Option B'}],
//           correctOptionIds: type==='mcq' ? ['A'] : ['A','B'],
//         })
//       } else if (type==='boolean'){
//         created = await createQuestion(quizId, { type, prompt: defaultPrompt(type), points:1, correctBoolean:true })
//       } else {
//         created = await createQuestion(quizId, { type, prompt: defaultPrompt(type), points:1, correctText:['Example'] })
//       }
//       const next = [...items, created].sort((a,b)=>a.order-b.order)
//       setItems(next as AnyQuestion[])
//       setOrderBaseline(next.map(x=>x.id))
//       setSelId(created.id) // open it immediately
//     }catch(e:any){ alert(describeError(e)) }
//   }

//   /* ---------- DnD ---------- */
//   function onDragStart(i:number, e:React.DragEvent){ dragFrom.current=i; e.dataTransfer.setData('text/plain', String(i)) }
//   function onDragOver(i:number, e:React.DragEvent){ e.preventDefault(); setDragOver(i) }
//   function onDrop(i:number, e:React.DragEvent){
//     e.preventDefault()
//     const from = dragFrom.current; dragFrom.current = null; setDragOver(null)
//     if (from==null || from===i) return
//     setItems(prev => reorderLocal(prev, from, i))
//   }

//   /* ---------- mark / unmark draft ids (for header dirty chip) ---------- */
//   const markDraft = (id:string, hasDraft:boolean)=>{
//     setDraftIds(prev=>{
//       const cp = new Set(prev)
//       if (hasDraft) cp.add(id); else cp.delete(id)
//       return cp
//     })
//   }

//   const onLocalPatch = (id: string, patch: Partial<AnyQuestion>) => {
//     setItems(prev => prev.map(q => q.id === id ? { ...q, ...patch } as AnyQuestion : q));
//   };

//   return (
//     <main className="container-app py-6">
//       {/* Header */}
//       <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
//         <div>
//           <h1 className="text-2xl font-semibold tracking-tight">{quiz?.title || 'Quiz Builder'}</h1>
//           <p className="text-sm text-gray-600">{items.length} questions · {sumPoints(items)} pts</p>
//         </div>
//         <div className="flex flex-wrap items-center gap-2">
//           {/* inline type select + add */}
//           <select className="input w-36 bg-white" value={addType} onChange={e=>setAddType(e.target.value as QType)}>
//             <option value="mcq">MCQ</option>
//             <option value="multi">Multiple</option>
//             <option value="boolean">True/False</option>
//             <option value="short">Short</option>
//           </select>
//           <Button variant="secondary" onClick={()=>quickAddQuestion(addType)}>Add question</Button>

//           {dirty && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">Unsaved changes</span>}
//           <Button onClick={saveAll} disabled={!dirty}>Save all</Button>
//           {!quiz?.isPublished
//             ? <Button onClick={doPublish} disabled={items.length<1}>Save & publish</Button>
//             : <Button variant="ghost" onClick={doUnpublish}>Unpublish</Button>}
//           <SettingsButton
//             attemptsAllowed={quiz?.attemptsAllowed ?? 1}
//             passPercent={quiz?.passPercent ?? 70}
//             timeLimitMin={Math.floor((quiz?.timeLimitSec ?? 0)/60)}
//             visibility={quiz?.visibility ?? 'public'}
//             onSave={updateSettings}
//           />
//         </div>
//       </div>

//       {err && <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}

//       {loading ? (
//         <div className="h-32 animate-pulse rounded-lg bg-gray-100" />
//       ) : (
//         <>
//           <div className="grid gap-4 lg:grid-cols-[340px,1fr]">
//             {/* Left list */}
//             <aside className="card p-3">
//               <div className="mb-2 text-sm font-medium text-gray-700">Questions</div>
//               {items.length===0 ? (
//                 <div className="rounded-md border border-dashed p-4 text-center text-sm text-gray-600">
//                   No questions yet. Use “Add question”.
//                 </div>
//               ) : (
//                 <ol className="space-y-2">
//                   {items.map((q, i)=>{
//                     const active = q.id===selId
//                     return (
//                       <li key={q.id}
//                           draggable
//                           onDragStart={(e)=>onDragStart(i,e)}
//                           onDragOver={(e)=>onDragOver(i,e)}
//                           onDrop={(e)=>onDrop(i,e)}
//                           className={`flex items-center gap-2 rounded-lg border px-2 py-2 text-sm transition
//                             ${active ? 'border-black bg-black text-white' : dragOver===i ? 'ring-2 ring-primary/40' : 'bg-white hover:bg-gray-50'}`}>
//                         <button className="flex-1 min-w-0 text-left" onClick={()=>setSelId(q.id)} title={q.prompt}>
//                           <div className="truncate">
//                             <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded bg-gray-100 text-xs text-gray-700">{i+1}</span>
//                             <TypeBadge t={q.type}/>
//                             <span className="ml-2">{q.prompt || '(no prompt)'}</span>
//                           </div>
//                           <div className={`${active ? 'text-white/80':'text-gray-500'} text-xs`}>{q.points} pt{q.points!==1?'s':''}</div>
//                         </button>
//                         <div className="flex shrink-0 items-center gap-1">
//                           <IconBtn onClick={()=>setItems(prev=>reorderLocal(prev,i,Math.max(0,i-1)))}>↑</IconBtn>
//                           <IconBtn onClick={()=>setItems(prev=>reorderLocal(prev,i,Math.min(items.length-1,i+1)))}>↓</IconBtn>
//                         </div>
//                       </li>
//                     )
//                   })}
//                 </ol>
//               )}
//             </aside>

//             {/* Right editor */}
//             <section className="card p-4">
//               {!selected ? (
//                 <div className="text-sm text-gray-600">Select a question to edit.</div>
//               ) : (
//                 <QuestionEditor
//                   key={selected.id}
//                   q={selected}
//                   onAutoSaveStart={()=>markDraft(selected.id, true)}
//                   onAutoSaveDone={()=>markDraft(selected.id, false)}
//                   onDelete={async()=>{
//                     if (!confirm('Delete this question?')) return
//                     await deleteQuestion(selected.id)
//                     markDraft(selected.id, false)
//                     await refresh()
//                   }}
//                 />
//               )}
//             </section>
//           </div>

//           {/* Bottom mini-toolbar */}
//           <div className="mt-6 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
//             <div className="flex items-center gap-2">
//               <select className="input w-36 bg-white" value={addType} onChange={e=>setAddType(e.target.value as QType)}>
//                 <option value="mcq">MCQ</option>
//                 <option value="multi">Multiple</option>
//                 <option value="boolean">True/False</option>
//                 <option value="short">Short</option>
//               </select>
//               <Button variant="secondary" onClick={()=>quickAddQuestion(addType)}>Add question</Button>
//             </div>
//             <div className="flex items-center gap-2">
//               <Button onClick={saveAll} disabled={!dirty}>Save all</Button>
//               {!quiz?.isPublished
//                 ? <Button onClick={doPublish} disabled={items.length<1}>Save & publish</Button>
//                 : <Button variant="ghost" onClick={doUnpublish}>Unpublish</Button>}
//             </div>
//           </div>
//         </>
//       )}
//     </main>
//   )
// }

// /* ----------------- Editor (auto-save) ----------------- */

// function QuestionEditor({
//   q, onAutoSaveStart, onAutoSaveDone, onDelete
// }:{
//   q: AnyQuestion
//   onAutoSaveStart: ()=>void
//   onAutoSaveDone: ()=>void
//   onDelete: ()=>Promise<void>
// }) {
//   const [prompt, setPrompt] = useState(q.prompt)
//   const [points, setPoints] = useState<number>((q as any).points ?? 1)
//   const [explanation, setExplanation] = useState<string>((q as any).explanation || '')
//   const [stem, setStem] = useState<Media[]>(q.media || [])

//   // auto-save batching
//   const pendingRef = useRef<Partial<AnyQuestion>>({})
//   const fireSave = useDebouncedCallback(async()=>{
//     const patch = pendingRef.current
//     pendingRef.current = {}
//     try{
//       await updateQuestion(q.id, patch as any)
//     } finally {
//       onAutoSaveDone()
//     }
//   }, 600)

//   const stage = (patch: Partial<AnyQuestion>)=>{
//     onAutoSaveStart()
//     pendingRef.current = { ...pendingRef.current, ...patch }
//     fireSave()
//   }

//   useEffect(()=>{ setPrompt(q.prompt); setPoints((q as any).points ?? 1); setExplanation((q as any).explanation || ''); setStem(q.media||[]) },[q])

//   // field → stage patch (auto)
//   useEffect(()=>{ if (q) stage({ prompt }) },[prompt])
//   useEffect(()=>{ if (q) stage({ points }) },[points])
//   useEffect(()=>{ if (q) stage({ explanation }) },[explanation])
//   useEffect(()=>{ if (q) stage({ media: stem }) },[stem])

//   return (
//     <div className="space-y-5">
//       <header className="flex items-center justify-between">
//         <div className="text-sm text-gray-600"><TypeBadge t={q.type}/> · {points} pt{points!==1?'s':''}</div>
//         <div className="flex items-center gap-2">
//           <Button variant="ghost" onClick={onDelete}>Delete</Button>
//         </div>
//       </header>

//       <div className="space-y-2">
//         <div className="text-sm font-medium text-gray-800">Stem image (optional)</div>
//         <ImagePicker value={stem} onChange={setStem} />
//       </div>

//       <label className="block text-sm">
//         <div className="mb-1 font-medium text-gray-800">Prompt</div>
//         <textarea className="input min-h-[160px]" placeholder={promptPlaceholder(q.type)} value={prompt} onChange={e=>setPrompt(e.target.value)} />
//         <div className="mt-1 text-xs text-gray-500">{prompt.length} characters</div>
//       </label>

//       {q.type==='mcq' || q.type==='multi'
//         ? <MCQMultiPanel q={q as any} stage={stage} />
//         : q.type==='boolean'
//           ? <BooleanPanel q={q as any} stage={stage} />
//           : <ShortPanel q={q as any} stage={stage} />
//       }

//       <label className="block text-sm">
//         <div className="mb-1 font-medium text-gray-800">Explanation (shown after submit)</div>
//         <textarea className="input min-h-[80px]" value={explanation} onChange={e=>setExplanation(e.target.value)} />
//       </label>

//       <label className="block text-sm">
//         <div className="mb-1 font-medium text-gray-800">Points</div>
//         <input type="number" min={0} className="input w-32" value={points} onChange={e=>setPoints(Math.max(0, Number(e.target.value)||0))} />
//       </label>
//     </div>
//   )
// }

// function MCQMultiPanel({ q, stage }:{
//   q: Extract<AnyQuestion, {type:'mcq'|'multi'}>;
//   stage: (patch:any)=>void;
// }) {
//   const [opts, setOpts] = useState(q.options || [])
//   const [correct, setCorrect] = useState<string[]>(q.correctOptionIds || [])

//   useEffect(()=>{ setOpts(q.options || []); setCorrect(q.correctOptionIds || []) },[q])

//   // autosave debounce for options + correctness
//   const debounced = useDebouncedCallback(()=>{
//     stage({ options: opts, correctOptionIds: correct })
//   }, 600)
//   useEffect(()=>{ debounced() },[opts, correct]) // eslint-disable-line

//   function letter(idx: number) {
//     let s = ''
//     let n = idx
//     do { s = String.fromCharCode(65 + (n % 26)) + s; n = Math.floor(n / 26) - 1 } while (n >= 0)
//     return s
//   }
  
//   const addOption = () => {
//     const nextId = letter(opts.length)
//     setOpts([...(opts || []), { id: nextId, text: '', media: [] }])
//   }
  
//   const removeOption = (i:number)=>{ const t=opts[i]; setOpts(opts.filter((_,idx)=>idx!==i)); setCorrect(correct.filter(c=>c!==t.id)) }
  
//   const setText = (i:number, text:string)=>{
//     const cp=[...opts]
//     cp[i] = { ...(cp[i]||{}), text: text.trim() }
//     setOpts(cp)
//   }
  
//   const toggleCorrect = (id:string)=>{ if(q.type==='mcq') setCorrect([id]); else setCorrect(correct.includes(id)? correct.filter(x=>x!==id) : [...correct,id]) }
//   const setMedia = (i:number, media:Media[])=>{ const cp=[...opts]; cp[i] = { ...(cp[i]||{}), media }; setOpts(cp) }

//   return (
//     <div className="space-y-3">
//       <div className="text-sm font-medium text-gray-800">Options</div>
//       {opts.map((o,i)=>{
//         const ok = correct.includes(o.id)
//         return (
//           <div key={o.id} className="rounded-lg border p-2">
//             <div className="flex items-center gap-2">
//               <button type="button" className={`h-8 w-8 rounded-md border ${ok?'bg-emerald-600 text-white border-emerald-600':'bg-white'}`} onClick={()=>toggleCorrect(o.id)}>{o.id}</button>
//               <input className="input h-9 flex-1" value={o.text} onChange={e=>setText(i, e.target.value)} placeholder={`Option ${o.id}`} />
//               <Button variant="ghost" onClick={()=>removeOption(i)}>Remove</Button>
//             </div>
//             <div className="mt-2">
//               <div className="mb-1 text-xs text-gray-600">Image (optional)</div>
//               <ImagePicker value={(o.media as Media[]) || []} onChange={(m)=>setMedia(i, m)} />
//             </div>
//           </div>
//         )
//       })}
//       <div className="flex items-center gap-2">
//         <Button variant="ghost" onClick={addOption}>Add option</Button>
//       </div>
//       <details className="rounded-md border bg-gray-50 p-2 text-sm text-gray-700">
//         <summary className="cursor-pointer select-none">Bulk add (one option per line)</summary>
//         <BulkAdd onAppend={(lines)=>{
//           const start=opts.length
//           const next = lines.map((t,idx)=>({ id: letter(start+idx), text: t, media: [] }))
//           setOpts([...(opts||[]), ...next])
//         }}/>
//       </details>
//     </div>
//   )
// }

// function BooleanPanel({ q, stage }:{
//   q: Extract<AnyQuestion,{type:'boolean'}>;
//   stage: (patch:any)=>void;
// }) {
//   const [val, setVal] = useState<boolean>(q.correctBoolean)
//   useEffect(()=>{ setVal(q.correctBoolean) },[q])
//   const debounced = useDebouncedCallback(()=>stage({ correctBoolean: val }), 400)
//   useEffect(()=>{ debounced() },[val]) // eslint-disable-line
//   return (
//     <div className="inline-flex overflow-hidden rounded-lg border">
//       <button type="button" className={`px-4 py-2 text-sm ${val ? 'bg-emerald-600 text-white' : 'bg-white'}`} onClick={()=>setVal(true)}>True</button>
//       <button type="button" className={`px-4 py-2 text-sm ${!val ? 'bg-emerald-600 text-white' : 'bg-white'}`} onClick={()=>setVal(false)}>False</button>
//     </div>
//   )
// }

// function ShortPanel({ q, stage }:{
//   q: Extract<AnyQuestion,{type:'short'}>;
//   stage: (patch:any)=>void;
// }) {
//   const [chips, setChips] = useState<string[]>(q.correctText || [])
//   const [input, setInput] = useState('')
//   useEffect(()=>{ setChips(q.correctText || []) },[q])
//   const debounced = useDebouncedCallback(()=>stage({ correctText: chips }), 600)
//   useEffect(()=>{ debounced() },[chips]) // eslint-disable-line
//   const add = ()=>{ const v=input.trim(); if(!v) return; if(!chips.includes(v)) setChips([...chips, v]); setInput('') }
//   const del = (v:string)=> setChips(chips.filter(x=>x!==v))
//   return (
//     <div className="space-y-2">
//       <div className="text-sm font-medium text-gray-800">Accepted answers</div>
//       <div className="flex flex-wrap gap-2">
//         {chips.map(v=>(
//           <span key={v} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-sm">
//             {v}<button className="text-gray-500 hover:text-black" onClick={()=>del(v)} aria-label="Remove">×</button>
//           </span>
//         ))}
//       </div>
//       <div className="flex items-center gap-2">
//         <input className="input flex-1" value={input} onChange={e=>setInput(e.target.value)} placeholder="Add an accepted answer…" onKeyDown={(e)=> e.key==='Enter' && add()} />
//         <Button variant="secondary" onClick={add}>Add</Button>
//       </div>
//     </div>
//   )
// }

// /* ----------------- helpers / UI bits ----------------- */

// function ImagePicker({ value, onChange }:{ value: Media[]; onChange:(m:Media[])=>void }){
//   async function onFile(e: React.ChangeEvent<HTMLInputElement>){
//     const f = e.target.files?.[0]; if(!f) return
//     try{
//       const url = await uploadImage(f)
//       onChange([{ kind:'image', url }])
//     } catch (err:any){
//       alert(err?.message || 'Upload failed')
//     } finally {
//       e.target.value = ''
//     }
//   }
//   function remove(){ onChange([]) }

//   return (
//     <div className="flex items-center gap-3">
//       {value?.[0]?.url ? (
//         <>
//           <img src={value[0].url} alt={value[0].alt||''} className="h-24 w-24 rounded object-cover ring-1 ring-black/5" />
//           <label className="inline-flex cursor-pointer items-center gap-2 rounded border px-3 py-2 text-sm hover:bg-gray-50">
//             <span>Replace</span>
//             <input type="file" className="hidden" accept="image/*" onChange={onFile}/>
//           </label>
//           <Button variant="ghost" onClick={remove}>Remove</Button>
//         </>
//       ) : (
//         <label className="inline-flex cursor-pointer items-center gap-2 rounded border px-3 py-2 text-sm hover:bg-gray-50">
//           <span>+ Add image</span>
//           <input type="file" className="hidden" accept="image/*" onChange={onFile}/>
//         </label>
//       )}
//     </div>
//   )
// }

// function BulkAdd({ onAppend }:{ onAppend:(lines:string[])=>void }){
//   const [txt, setTxt] = useState('')
//   function apply(){
//     const lines = txt.split('\n').map(s=>s.trim()).filter(Boolean)
//     if (lines.length) onAppend(lines)
//     setTxt('')
//   }
//   return (
//     <div>
//       <textarea className="mt-2 w-full rounded-md border p-2 text-sm" rows={4} value={txt} onChange={(e)=>setTxt(e.target.value)} placeholder={'Option line 1\nOption line 2\n…'} />
//       <div className="mt-2"><Button variant="secondary" onClick={apply}>Append</Button></div>
//     </div>
//   )
// }

// function IconBtn({ onClick, children }:{ onClick:()=>void; children: React.ReactNode }){
//   return <button onClick={onClick} className="rounded-md border px-2 py-1 text-xs hover:bg-gray-50" type="button">{children}</button>
// }
// function TypeBadge({ t }:{ t: QType }){
//   const label = t==='mcq' ? 'MCQ' : t==='multi' ? 'Multiple' : t==='boolean' ? 'True/False' : 'Short'
//   return <span className="rounded-full border px-2 py-0.5 text-[11px]">{label}</span>
// }

// function SettingsButton({ attemptsAllowed, passPercent, timeLimitMin, visibility, onSave }:{
//   attemptsAllowed:number; passPercent:number; timeLimitMin:number; visibility:'public'|'enrolled';
//   onSave:(p:{attemptsAllowed?:number; passPercent?:number; timeLimitMin?:number; visibility?:'public'|'enrolled'})=>Promise<void>
// }){
//   const [open, setOpen] = useState(false)
//   const [a, setA] = useState(attemptsAllowed)
//   const [p, setP] = useState(passPercent)
//   const [m, setM] = useState(timeLimitMin)
//   const [v, setV] = useState<'public'|'enrolled'>(visibility)
//   useEffect(()=>{ setA(attemptsAllowed); setP(passPercent); setM(timeLimitMin); setV(visibility) },[attemptsAllowed,passPercent,timeLimitMin,visibility])
//   async function save(){ await onSave({ attemptsAllowed:a, passPercent:p, timeLimitMin:m, visibility:v }); setOpen(false) }
//   return (
//     <div className="relative">
//       <Button variant="ghost" onClick={()=>setOpen(v=>!v)}>Settings</Button>
//       {open && (
//         <div className="absolute right-0 z-10 mt-2 w-80 rounded-xl border bg-white p-3 shadow-md">
//           <div className="grid gap-3 sm:grid-cols-2">
//             <label className="block text-sm"><div className="mb-1 font-medium text-gray-800">Attempts allowed</div>
//               <input type="number" min={1} className="input" value={a} onChange={e=>setA(Math.max(1, Number(e.target.value)||1))}/></label>
//             <label className="block text-sm"><div className="mb-1 font-medium text-gray-800">Pass %</div>
//               <input type="number" min={0} max={100} className="input" value={p} onChange={e=>setP(Math.max(0, Math.min(100, Number(e.target.value)||0)))}/></label>
//             <label className="block text-sm"><div className="mb-1 font-medium text-gray-800">Time limit (minutes)</div>
//               <input type="number" min={0} className="input" value={m} onChange={e=>setM(Math.max(0, Number(e.target.value)||0))}/>
//               <div className="mt-1 text-xs text-gray-500">0 = unlimited</div></label>
//             <label className="block text-sm"><div className="mb-1 font-medium text-gray-800">Visibility</div>
//               <select className="input bg-white" value={v} onChange={e=>setV(e.target.value as any)}>
//                 <option value="public">public</option>
//                 <option value="enrolled">enrolled</option>
//               </select></label>
//           </div>
//           <div className="mt-3 flex items-center justify-end gap-2">
//             <Button variant="ghost" onClick={()=>setOpen(false)}>Close</Button>
//             <Button onClick={save}>Save changes</Button>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import Button from '@/components/ui/Button'
import { uploadImage } from '@/lib/upload.api'
import {
  listQuestions, createQuestion, updateQuestion, reorderQuestion, deleteQuestion, type QuizQuestion
} from '@/lib/instructorQuizQuestions.api'
import { getMyQuiz, publishQuiz, unpublishQuiz, updateQuizBasics } from '@/lib/instructorQuizzes.api'
import AutoGrowTextArea from "@/components/ui/AutoGrowTextArea";
import { useFlushableDebounce } from "@/hooks/useFlushableDebounce";

type QType = 'mcq'|'multi'|'boolean'|'short'
type Media = { kind:'image'; url:string; alt?:string }
type AnyQuestion = QuizQuestion & { media?: Media[]; options?: Array<{ id:string; text:string; media?: Media[] }> }

/* ----------------- small utilities ----------------- */
function useDebouncedCallback<T extends any[]>(fn:(...a:T)=>void, delay=600){
  const t = useRef<ReturnType<typeof setTimeout>|null>(null)
  return (...args:T)=>{
    if (t.current) clearTimeout(t.current)
    t.current = setTimeout(()=>fn(...args), delay)
  }
}
function describeError(e:any){
  const code = e?.response?.status
  const msg  = e?.response?.data?.message || e?.message || 'Request failed'
  return code ? `${code} • ${msg}` : msg
}
function promptPlaceholder(t:QType){
  if (t==='mcq') return 'Which option BEST fits? Add relevant stem details above (image optional).'
  if (t==='multi') return 'Select ALL that apply. Add relevant stem and constraints.'
  if (t==='boolean') return 'This statement is true or false.'
  return 'Brief, case-relevant short answer (exact match).'
}
function defaultPrompt(t:QType){
  if (t==='mcq') return 'Single-correct question'
  if (t==='multi') return 'Multi-select question'
  if (t==='boolean') return 'This statement is true or false'
  return 'Short answer question'
}
function reorderLocal<T extends {id:string}>(arr:T[], from:number, to:number){
  if (from===to) return arr
  const cp=[...arr]; const it=cp.splice(from,1)[0]; cp.splice(to,0,it)
  return cp.map((x:any, i)=>({ ...x, order:i }))
}
const sumPoints = (list: AnyQuestion[]) => list.reduce((s,q)=> s+(q.points||0), 0)

/* =================================================== */

export default function QuestionStudio() {
  const { id: quizId='' } = useParams()

  const [quiz, setQuiz] = useState<any>(null)
  const [items, setItems] = useState<AnyQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string|null>(null)

  const [selId, setSelId] = useState<string|null>(null)
  const selected = useMemo(()=> items.find(q=>q.id===selId) || null, [items, selId])

  // ordering & dirty
  const [orderBaseline, setOrderBaseline] = useState<string[]>([])
  const [draftIds, setDraftIds] = useState<Set<string>>(new Set()) // which questions have queued autosave
  const dirty = useMemo(()=>{
    if (orderBaseline.length !== items.length) return true
    if (items.some((q,i)=>q.id !== orderBaseline[i])) return true
    return draftIds.size > 0
  },[items, orderBaseline, draftIds])

  // DnD
  const dragFrom = useRef<number|null>(null)
  const [dragOver, setDragOver] = useState<number|null>(null)

  // “Add question” type select
  const [addType, setAddType] = useState<QType>('mcq')
  const hasDrafts = draftIds.size > 0;

  useEffect(()=>{ (async()=>{
    try {
      setLoading(true); setErr(null)
      const [q, list] = await Promise.all([ getMyQuiz(quizId), listQuestions(quizId) ])
      setQuiz(q); setItems(list as AnyQuestion[])
      setOrderBaseline(list.map(x=>x.id))
      if (!selId && list.length) setSelId(list[0].id)
    } catch(e:any){ setErr(describeError(e)) }
    finally { setLoading(false) }
  })() },[quizId])

  // leave guard
  useEffect(()=>{
    const h = (e: BeforeUnloadEvent) => { if(dirty){ e.preventDefault(); e.returnValue='' } }
    window.addEventListener('beforeunload', h)
    return ()=> window.removeEventListener('beforeunload', h)
  },[dirty])

  async function refresh(selectId?:string){
    const list = await listQuestions(quizId)
    setItems(list as AnyQuestion[])
    setOrderBaseline(list.map(x=>x.id))
    if (selectId) setSelId(selectId)
    else if (!selId && list.length) setSelId(list[0].id)
  }

  /* ---------- header actions ---------- */
  async function saveAll(){
    try{
      // persist ordering
      const want = items.map(x=>x.id)
      if (want.join('|') !== orderBaseline.join('|')){
        for (let i=0;i<want.length;i++){
          if (orderBaseline[i] !== want[i]) await reorderQuestion(want[i], i)
        }
        setOrderBaseline(want)
      }
      // flush any drafts by forcing a refresh (auto-saves already fired)
      setDraftIds(new Set())
      await refresh(selId || undefined)
    }catch(e:any){
      alert(describeError(e))
      await refresh(selId || undefined)
    }
  }
  async function doPublish(){
    if (items.length<1) return alert('Add at least one question before publishing.')
    if (dirty) await saveAll()
    const q = await publishQuiz(quizId); setQuiz(q); alert('Published')
  }
  async function doUnpublish(){
    if (dirty) await saveAll()
    const q = await unpublishQuiz(quizId); setQuiz(q); alert('Unpublished')
  }
  async function updateSettings(patch: { attemptsAllowed?:number; passPercent?:number; timeLimitMin?:number; visibility?:'public'|'enrolled' }){
    const body:any = {}
    if (patch.attemptsAllowed!=null) body.attemptsAllowed = Math.max(1, patch.attemptsAllowed)
    if (patch.passPercent!=null) body.passPercent = Math.max(0, Math.min(100, patch.passPercent))
    if (patch.timeLimitMin!=null) body.timeLimitSec = Math.max(0, patch.timeLimitMin * 60) // minutes → seconds
    if (patch.visibility) body.visibility = patch.visibility
    const updated = await updateQuizBasics(quizId, body)
    setQuiz(updated)
  }

  /* ---------- add question (no modal) ---------- */
  async function quickAddQuestion(type: QType){
    try{
      let created:any
      if (type==='mcq' || type==='multi'){
        created = await createQuestion(quizId, {
          type, prompt: defaultPrompt(type), points:1,
          options:[{id:'A',text:'Option A'},{id:'B',text:'Option B'}],
          correctOptionIds: type==='mcq' ? ['A'] : ['A','B'],
        })
      } else if (type==='boolean'){
        created = await createQuestion(quizId, { type, prompt: defaultPrompt(type), points:1, correctBoolean:true })
      } else {
        created = await createQuestion(quizId, { type, prompt: defaultPrompt(type), points:1, correctText:['Example'] })
      }
      const next = [...items, created].sort((a,b)=>a.order-b.order)
      setItems(next as AnyQuestion[])
      setOrderBaseline(next.map(x=>x.id))
      setSelId(created.id) // open it immediately
    }catch(e:any){ alert(describeError(e)) }
  }

  /* ---------- DnD ---------- */
  function onDragStart(i:number, e:React.DragEvent){ dragFrom.current=i; e.dataTransfer.setData('text/plain', String(i)) }
  function onDragOver(i:number, e:React.DragEvent){ e.preventDefault(); setDragOver(i) }
  function onDrop(i:number, e:React.DragEvent){
    e.preventDefault()
    const from = dragFrom.current; dragFrom.current = null; setDragOver(null)
    if (from==null || from===i) return
    setItems(prev => reorderLocal(prev, from, i))
  }

  /* ---------- mark / unmark draft ids (for header dirty chip) ---------- */
  const markDraft = (id:string, hasDraft:boolean)=>{
    setDraftIds(prev=>{
      const cp = new Set(prev)
      if (hasDraft) cp.add(id); else cp.delete(id)
      return cp
    })
  }

  // ---- mirror local edits from editor into parent items (optimistic) ----
  const onLocalPatch = (id: string, patch: Partial<AnyQuestion>) => {
    setItems(prev => prev.map(q => q.id === id ? { ...q, ...patch } as AnyQuestion : q));
  };

  return (
    <main className="container-app py-6">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{quiz?.title || 'Quiz Builder'}</h1>
          <p className="text-sm text-gray-600">
            {items.length} questions · {sumPoints(items)} pts
            {hasDrafts && (
              <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">Saving…</span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* inline type select + add */}
          <select className="input w-36 bg-white" value={addType} onChange={e=>setAddType(e.target.value as QType)}>
            <option value="mcq">MCQ</option>
            <option value="multi">Multiple</option>
            <option value="boolean">True/False</option>
            <option value="short">Short</option>
          </select>
          <Button variant="secondary" onClick={()=>quickAddQuestion(addType)}>Add question</Button>

          {dirty && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">Unsaved changes</span>}
          <Button onClick={saveAll} disabled={!dirty}>Save all</Button>
          {!quiz?.isPublished
            ? <Button onClick={doPublish} disabled={items.length<1}>Save & publish</Button>
            : <Button variant="ghost" onClick={doUnpublish}>Unpublish</Button>}
          <SettingsButton
            attemptsAllowed={quiz?.attemptsAllowed ?? 1}
            passPercent={quiz?.passPercent ?? 70}
            timeLimitMin={Math.floor((quiz?.timeLimitSec ?? 0)/60)}
            visibility={quiz?.visibility ?? 'public'}
            onSave={updateSettings}
          />
        </div>
      </div>

      {err && <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}

      {loading ? (
        <div className="h-32 animate-pulse rounded-lg bg-gray-100" />
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-[340px,1fr]">
            {/* Left list */}
            <aside className="card p-3">
              <div className="mb-2 text-sm font-medium text-gray-700">Questions</div>
              {items.length===0 ? (
                <div className="rounded-md border border-dashed p-4 text-center text-sm text-gray-600">
                  No questions yet. Use “Add question”.
                </div>
              ) : (
                <ol className="space-y-2">
                  {items.map((q, i)=>{
                    const active = q.id===selId
                    return (
                      <li key={q.id}
                          draggable
                          onDragStart={(e)=>onDragStart(i,e)}
                          onDragOver={(e)=>onDragOver(i,e)}
                          onDrop={(e)=>onDrop(i,e)}
                          className={`flex items-center gap-2 rounded-lg border px-2 py-2 text-sm transition
                            ${active ? 'border-black bg-black text-white' : dragOver===i ? 'ring-2 ring-primary/40' : 'bg-white hover:bg-gray-50'}`}>
                        <button className="flex-1 min-w-0 text-left" onClick={()=>setSelId(q.id)} title={q.prompt}>
                          <div className="truncate">
                            <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded bg-gray-100 text-xs text-gray-700">{i+1}</span>
                            <TypeBadge t={q.type}/>
                            <span className="ml-2">{q.prompt || '(no prompt)'}</span>
                          </div>
                          <div className={`${active ? 'text-white/80':'text-gray-500'} text-xs`}>{q.points} pt{q.points!==1?'s':''}</div>
                        </button>
                        <div className="flex shrink-0 items-center gap-1">
                          <IconBtn onClick={()=>setItems(prev=>reorderLocal(prev,i,Math.max(0,i-1)))}>↑</IconBtn>
                          <IconBtn onClick={()=>setItems(prev=>reorderLocal(prev,i,Math.min(items.length-1,i+1)))}>↓</IconBtn>
                        </div>
                      </li>
                    )
                  })}
                </ol>
              )}
            </aside>

            {/* Right editor */}
            <section className="card p-4">
              {!selected ? (
                <div className="text-sm text-gray-600">Select a question to edit.</div>
              ) : (
                <QuestionEditor
                  key={selected.id}
                  q={selected}
                  onLocalPatch={onLocalPatch}
                  onAutoSaveStart={()=>markDraft(selected.id, true)}
                  onAutoSaveDone={()=>markDraft(selected.id, false)}
                  onDelete={async()=>{
                    if (!confirm('Delete this question?')) return
                    await deleteQuestion(selected.id)
                    markDraft(selected.id, false)
                    await refresh()
                  }}
                />
              )}
            </section>
          </div>

          {/* Bottom mini-toolbar */}
          <div className="mt-6 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <select className="input w-36 bg-white" value={addType} onChange={e=>setAddType(e.target.value as QType)}>
                <option value="mcq">MCQ</option>
                <option value="multi">Multiple</option>
                <option value="boolean">True/False</option>
                <option value="short">Short</option>
              </select>
              <Button variant="secondary" onClick={()=>quickAddQuestion(addType)}>Add question</Button>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={saveAll} disabled={!dirty}>Save all</Button>
              {!quiz?.isPublished
                ? <Button onClick={doPublish} disabled={items.length<1}>Save & publish</Button>
                : <Button variant="ghost" onClick={doUnpublish}>Unpublish</Button>}
            </div>
          </div>
        </>
      )}
    </main>
  )
}

/* ----------------- Editor (auto-save) ----------------- */

function QuestionEditor({
  q, onLocalPatch, onAutoSaveStart, onAutoSaveDone, onDelete
}:{
  q: AnyQuestion
  onLocalPatch: (id: string, patch: Partial<AnyQuestion>) => void
  onAutoSaveStart: ()=>void
  onAutoSaveDone: ()=>void
  onDelete: ()=>Promise<void>
}) {
  const [prompt, setPrompt] = useState(q.prompt)
  const [points, setPoints] = useState<number>((q as any).points ?? 1)
  const [explanation, setExplanation] = useState<string>((q as any).explanation || '')
  const [stem, setStem] = useState<Media[]>(q.media || [])

  // ---- autosave batching (flushable) ----
  const pendingRef = useRef<Partial<AnyQuestion>>({})

  const doSave = async ()=>{
    const patch = pendingRef.current
    pendingRef.current = {}
    try{
      if (Object.keys(patch).length) {
        await updateQuestion(q.id, patch as any)
      }
    } finally {
      onAutoSaveDone()
    }
  }
  const { schedule: fireSave, flush: flushSave, cancel: cancelSave } = useFlushableDebounce(doSave, 600)

  const stage = (patch: Partial<AnyQuestion>)=>{
    onAutoSaveStart()
    onLocalPatch(q.id, patch)                 // mirror to parent immediately
    pendingRef.current = { ...pendingRef.current, ...patch }
    fireSave()
  }

  // seed local state ONLY when the question changes (by id)
  useEffect(()=>{
    setPrompt(q.prompt)
    setPoints((q as any).points ?? 1)
    setExplanation((q as any).explanation || '')
    setStem(q.media || [])
  },[q.id])

  // ensure pending edits flush when switching questions/unmounting
  useEffect(()=>{
    return ()=> { flushSave().catch(()=>{}); cancelSave() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q.id])

  // field → stage patch (auto), but only if changed vs current prop to avoid loops
  useEffect(()=>{
    if (prompt !== q.prompt) stage({ prompt })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[prompt, q.id])

  useEffect(()=>{
    const qp = ((q as any).points ?? 1)
    if (points !== qp) stage({ points })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[points, q.id])

  useEffect(()=>{
    const qe = ((q as any).explanation || '')
    if (explanation !== qe) stage({ explanation })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[explanation, q.id])

  useEffect(()=>{
    // media: depend on stem only (no need to compare deep each render)
    stage({ media: stem })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[stem])

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between">
        <div className="text-sm text-gray-600"><TypeBadge t={q.type}/> · {points} pt{points!==1?'s':''}</div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={onDelete}>Delete</Button>
        </div>
      </header>

      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-800">Stem image (optional)</div>
        <ImagePicker value={stem} onChange={(m)=>{ setStem(m) }} />
      </div>

      <label className="block text-sm">
        <div className="mb-1 font-medium text-gray-800">Prompt</div>
        <AutoGrowTextArea
          className="input min-h-[160px] leading-6"
          placeholder={promptPlaceholder(q.type)}
          value={prompt}
          onChange={e=>setPrompt(e.target.value)}
          onBlur={()=>flushSave()}
        />
        <div className="mt-1 text-xs text-gray-500">{prompt.length} characters</div>
      </label>

      {q.type==='mcq' || q.type==='multi'
        ? <MCQMultiPanel q={q as any} stage={stage} />
        : q.type==='boolean'
          ? <BooleanPanel q={q as any} stage={stage} />
          : <ShortPanel q={q as any} stage={stage} />
      }

      <label className="block text-sm">
        <div className="mb-1 font-medium text-gray-800">Explanation (shown after submit)</div>
        <AutoGrowTextArea
          className="input min-h-[80px]"
          value={explanation}
          onChange={e=>setExplanation(e.target.value)}
          onBlur={()=>flushSave()}
        />
      </label>

      <label className="block text-sm">
        <div className="mb-1 font-medium text-gray-800">Points</div>
        <input
          type="number" min={0}
          className="input w-32"
          value={points}
          onChange={e=>setPoints(Math.max(0, Number(e.target.value)||0))}
          onBlur={()=>flushSave()}
        />
      </label>
    </div>
  )
}

function MCQMultiPanel({ q, stage }:{
  q: Extract<AnyQuestion, {type:'mcq'|'multi'}>;
  stage: (patch:any)=>void;
}) {
  const [opts, setOpts] = useState(q.options || [])
  const [correct, setCorrect] = useState<string[]>(q.correctOptionIds || [])

  // seed local options only when switching questions
  useEffect(()=>{ setOpts(q.options || []); setCorrect(q.correctOptionIds || []) },[q.id])

  // autosave debounce for options + correctness
  const debounced = useDebouncedCallback(()=>{
    stage({ options: opts, correctOptionIds: correct })
  }, 600)
  useEffect(()=>{ debounced() },[opts, correct]) // eslint-disable-line

  function letter(idx: number) {
    let s = ''
    let n = idx
    do { s = String.fromCharCode(65 + (n % 26)) + s; n = Math.floor(n / 26) - 1 } while (n >= 0)
    return s
  }
  
  const addOption = () => {
    const nextId = letter(opts.length)
    setOpts([...(opts || []), { id: nextId, text: '', media: [] }])
  }
  
  const removeOption = (i:number)=>{ const t=opts[i]; setOpts(opts.filter((_,idx)=>idx!==i)); setCorrect(correct.filter(c=>c!==t.id)) }
  
  const setText = (i:number, text:string)=>{
    const cp=[...opts]
    cp[i] = { ...(cp[i]||{}), text: text }
    setOpts(cp)
  }
  
  const toggleCorrect = (id:string)=>{ if(q.type==='mcq') setCorrect([id]); else setCorrect(correct.includes(id)? correct.filter(x=>x!==id) : [...correct,id]) }
  const setMedia = (i:number, media:Media[])=>{ const cp=[...opts]; cp[i] = { ...(cp[i]||{}), media }; setOpts(cp) }

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-gray-800">Options</div>
      {opts.map((o,i)=>{
        const ok = correct.includes(o.id)
        return (
          <div key={o.id} className="rounded-lg border p-2">
            <div className="flex items-center gap-2">
              <button type="button" className={`h-8 w-8 rounded-md border ${ok?'bg-emerald-600 text-white border-emerald-600':'bg-white'}`} onClick={()=>toggleCorrect(o.id)}>{o.id}</button>
              <input className="input h-9 flex-1" value={o.text} onChange={e=>setText(i, e.target.value)} placeholder={`Option ${o.id}`} />
              <Button variant="ghost" onClick={()=>removeOption(i)}>Remove</Button>
            </div>
            <div className="mt-2">
              <div className="mb-1 text-xs text-gray-600">Image (optional)</div>
              <ImagePicker value={(o.media as Media[]) || []} onChange={(m)=>setMedia(i, m)} />
            </div>
          </div>
        )
      })}
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={addOption}>Add option</Button>
      </div>
      <details className="rounded-md border bg-gray-50 p-2 text-sm text-gray-700">
        <summary className="cursor-pointer select-none">Bulk add (one option per line)</summary>
        <BulkAdd onAppend={(lines)=>{
          const start=opts.length
          const next = lines.map((t,idx)=>({ id: letter(start+idx), text: t, media: [] }))
          setOpts([...(opts||[]), ...next])
        }}/>
      </details>
    </div>
  )
}

function BooleanPanel({ q, stage }:{
  q: Extract<AnyQuestion,{type:'boolean'}>;
  stage: (patch:any)=>void;
}) {
  const [val, setVal] = useState<boolean>(q.correctBoolean)
  useEffect(()=>{ setVal(q.correctBoolean) },[q.id])
  const debounced = useDebouncedCallback(()=>stage({ correctBoolean: val }), 400)
  useEffect(()=>{ debounced() },[val]) // eslint-disable-line
  return (
    <div className="inline-flex overflow-hidden rounded-lg border">
      <button type="button" className={`px-4 py-2 text-sm ${val ? 'bg-emerald-600 text-white' : 'bg-white'}`} onClick={()=>setVal(true)}>True</button>
      <button type="button" className={`px-4 py-2 text-sm ${!val ? 'bg-emerald-600 text-white' : 'bg-white'}`} onClick={()=>setVal(false)}>False</button>
    </div>
  )
}

function ShortPanel({ q, stage }:{
  q: Extract<AnyQuestion,{type:'short'}>;
  stage: (patch:any)=>void;
}) {
  const [chips, setChips] = useState<string[]>(q.correctText || [])
  const [input, setInput] = useState('')
  useEffect(()=>{ setChips(q.correctText || []) },[q.id])
  const debounced = useDebouncedCallback(()=>stage({ correctText: chips }), 600)
  useEffect(()=>{ debounced() },[chips]) // eslint-disable-line
  const add = ()=>{ const v=input.trim(); if(!v) return; if(!chips.includes(v)) setChips([...chips, v]); setInput('') }
  const del = (v:string)=> setChips(chips.filter(x=>x!==v))
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-gray-800">Accepted answers</div>
      <div className="flex flex-wrap gap-2">
        {chips.map(v=>(
          <span key={v} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-sm">
            {v}<button className="text-gray-500 hover:text-black" onClick={()=>del(v)} aria-label="Remove">×</button>
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input className="input flex-1" value={input} onChange={e=>setInput(e.target.value)} placeholder="Add an accepted answer…" onKeyDown={(e)=> e.key==='Enter' && add()} />
        <Button variant="secondary" onClick={add}>Add</Button>
      </div>
    </div>
  )
}

/* ----------------- helpers / UI bits ----------------- */

function ImagePicker({ value, onChange }:{ value: Media[]; onChange:(m:Media[])=>void }){
  async function onFile(e: React.ChangeEvent<HTMLInputElement>){
    const f = e.target.files?.[0]; if(!f) return
    try{
      const url = await uploadImage(f)
      onChange([{ kind:'image', url }])
    } catch (err:any){
      alert(err?.message || 'Upload failed')
    } finally {
      e.target.value = ''
    }
  }
  function remove(){ onChange([]) }

  return (
    <div className="flex items-center gap-3">
      {value?.[0]?.url ? (
        <>
          <img src={value[0].url} alt={value[0].alt||''} className="h-24 w-24 rounded object-cover ring-1 ring-black/5" />
          <label className="inline-flex cursor-pointer items-center gap-2 rounded border px-3 py-2 text-sm hover:bg-gray-50">
            <span>Replace</span>
            <input type="file" className="hidden" accept="image/*" onChange={onFile}/>
          </label>
          <Button variant="ghost" onClick={remove}>Remove</Button>
        </>
      ) : (
        <label className="inline-flex cursor-pointer items-center gap-2 rounded border px-3 py-2 text-sm hover:bg-gray-50">
          <span>+ Add image</span>
          <input type="file" className="hidden" accept="image/*" onChange={onFile}/>
        </label>
      )}
    </div>
  )
}

function BulkAdd({ onAppend }:{ onAppend:(lines:string[])=>void }){
  const [txt, setTxt] = useState('')
  function apply(){
    const lines = txt.split('\n').map(s=>s.trim()).filter(Boolean)
    if (lines.length) onAppend(lines)
    setTxt('')
  }
  return (
    <div>
      <textarea className="mt-2 w-full rounded-md border p-2 text-sm" rows={4} value={txt} onChange={(e)=>setTxt(e.target.value)} placeholder={'Option line 1\nOption line 2\n…'} />
      <div className="mt-2"><Button variant="secondary" onClick={apply}>Append</Button></div>
    </div>
  )
}

function IconBtn({ onClick, children }:{ onClick:()=>void; children: React.ReactNode }){
  return <button onClick={onClick} className="rounded-md border px-2 py-1 text-xs hover:bg-gray-50" type="button">{children}</button>
}
function TypeBadge({ t }:{ t: QType }){
  const label = t==='mcq' ? 'MCQ' : t==='multi' ? 'Multiple' : t==='boolean' ? 'True/False' : 'Short'
  return <span className="rounded-full border px-2 py-0.5 text-[11px]">{label}</span>
}

function SettingsButton({ attemptsAllowed, passPercent, timeLimitMin, visibility, onSave }:{
  attemptsAllowed:number; passPercent:number; timeLimitMin:number; visibility:'public'|'enrolled';
  onSave:(p:{attemptsAllowed?:number; passPercent?:number; timeLimitMin?:number; visibility?:'public'|'enrolled'})=>Promise<void>
}){
  const [open, setOpen] = useState(false)
  const [a, setA] = useState(attemptsAllowed)
  const [p, setP] = useState(passPercent)
  const [m, setM] = useState(timeLimitMin)
  const [v, setV] = useState<'public'|'enrolled'>(visibility)
  useEffect(()=>{ setA(attemptsAllowed); setP(passPercent); setM(timeLimitMin); setV(visibility) },[attemptsAllowed,passPercent,timeLimitMin,visibility])
  async function save(){ await onSave({ attemptsAllowed:a, passPercent:p, timeLimitMin:m, visibility:v }); setOpen(false) }
  return (
    <div className="relative">
      <Button variant="ghost" onClick={()=>setOpen(v=>!v)}>Settings</Button>
      {open && (
        <div className="absolute right-0 z-10 mt-2 w-80 rounded-xl border bg-white p-3 shadow-md">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm"><div className="mb-1 font-medium text-gray-800">Attempts allowed</div>
              <input type="number" min={1} className="input" value={a} onChange={e=>setA(Math.max(1, Number(e.target.value)||1))}/></label>
            <label className="block text-sm"><div className="mb-1 font-medium text-gray-800">Pass %</div>
              <input type="number" min={0} max={100} className="input" value={p} onChange={e=>setP(Math.max(0, Math.min(100, Number(e.target.value)||0)))}/></label>
            <label className="block text-sm"><div className="mb-1 font-medium text-gray-800">Time limit (minutes)</div>
              <input type="number" min={0} className="input" value={m} onChange={e=>setM(Math.max(0, Number(e.target.value)||0))}/>
              <div className="mt-1 text-xs text-gray-500">0 = unlimited</div></label>
            <label className="block text-sm"><div className="mb-1 font-medium text-gray-800">Visibility</div>
              <select className="input bg-white" value={v} onChange={e=>setV(e.target.value as any)}>
                <option value="public">public</option>
                <option value="enrolled">enrolled</option>
              </select></label>
          </div>
          <div className="mt-3 flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={()=>setOpen(false)}>Close</Button>
            <Button onClick={save}>Save changes</Button>
          </div>
        </div>
      )}
    </div>
  )
}
