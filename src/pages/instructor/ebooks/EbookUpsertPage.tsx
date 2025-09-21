import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Button from '@/components/ui/Button'
import { api } from '@/lib/api'

import {
  createDraftEbook,
  getMyEbook,
  updateEbookBasics,
  updateEbookPricing,
  publishEbook,
  unpublishEbook,
  archiveEbook,
  restoreEbook,
  deleteEbook,
  listEbookItems,
  createEbookItem,
  updateEbookItem,
  deleteEbookItem,
  reorderEbookItems,
} from '@/lib/instructorEbooks.api'

const CURRENCIES = ['GBP','USD','EUR']

function pricePretty(p) {
  if (!p || p.isFree || !p.amountMinor) return 'Free'
  try { return new Intl.NumberFormat(undefined, { style:'currency', currency: p.currency || 'GBP' }).format((p.amountMinor || 0)/100) }
  catch {
    const amount = (p.amountMinor || 0)/100
    return `${amount.toFixed(2)} ${p.currency || ''}`
  }
}

async function uploadToServer(file: File) {
  const fd = new FormData()
  fd.append('file', file)
  const { data } = await api.post('/uploads', fd, { headers: { 'Content-Type': 'multipart/form-data' }, withCredentials: true })
  const url = data?.url || data?.fileUrl || data?.location || data?.href || data?.path
  if (!url) throw new Error('Upload response missing url')
  if (/^https?:\/\//i.test(url)) return url
  const base = (api.defaults.baseURL || '').replace(/\/$/, '')
  const rel  = url.startsWith('/') ? url : `/${url}`
  return `${base}${rel}`
}

export default function EbookUpsertPage() {
  const { id } = useParams()
  const nav = useNavigate()
  const qc  = useQueryClient()

  const [ebookId, setEbookId] = useState(id || null)

  const { data, isLoading: loadingRes } = useQuery({
    queryKey: ['myEbook', ebookId],
    queryFn: () => getMyEbook(ebookId),
    enabled: !!ebookId,
    staleTime: 10_000,
  })

  const ebook = data?.ebook
  const { data: items = [], isLoading: loadingItems, isFetching: fetchingItems } = useQuery({
    queryKey: ['myEbookItems', ebookId],
    queryFn: () => listEbookItems(ebookId as string),
    enabled: !!ebookId,
    staleTime: 10_000,
  })

  // form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [thumbnail, setThumbnail] = useState('')

  const [amountMajor, setAmountMajor] = useState('0')
  const [currency, setCurrency] = useState('GBP')
  const [includedInMembership, setIncludedInMembership] = useState(true)

  const [saving, setSaving] = useState(false)
  const [uploadingThumb, setUploadingThumb] = useState(false)
  const [msg, setMsg] = useState<string|null>(null)
  const [err, setErr] = useState<string|null>(null)

  useEffect(() => {
    if (!ebook) return
    setTitle(ebook.title || '')
    setDescription(ebook.description || '')
    setCategory(ebook.category || '')
    setThumbnail(ebook.thumbnail || '')
    const p = ebook.pricing || {}
    setAmountMajor(((p.amountMinor || 0)/100).toFixed(2))
    setCurrency(p.currency || 'GBP')
    setIncludedInMembership(!!p.includedInMembership)
  }, [ebook])

  // publish/archive, etc.
  const mPublish   = useMutation({ mutationFn: () => publishEbook(ebookId as string),   onSuccess: () => qc.invalidateQueries({ queryKey: ['myEbook', ebookId] }) })
  const mUnpublish = useMutation({ mutationFn: () => unpublishEbook(ebookId as string), onSuccess: () => qc.invalidateQueries({ queryKey: ['myEbook', ebookId] }) })
  const mArchive   = useMutation({ mutationFn: () => archiveEbook(ebookId as string),   onSuccess: () => qc.invalidateQueries({ queryKey: ['myEbook', ebookId] }) })
  const mRestore   = useMutation({ mutationFn: () => restoreEbook(ebookId as string),   onSuccess: () => qc.invalidateQueries({ queryKey: ['myEbook', ebookId] }) })
  const mDelete    = useMutation({
    mutationFn: () => deleteEbook(ebookId as string),
    onSuccess: () => nav('/instructor/ebooks'),
  })

  // ensure draft
  const ensureEbook = async () => {
    if (ebookId) return ebookId
    if (!title.trim()) throw new Error('Please enter a title before adding items.')
    const created = await createDraftEbook({ title: title.trim() })
    setEbookId(created.id)
    nav(`/instructor/ebooks/${created.id}`, { replace: true })
    await updateEbookBasics(created.id, { title: title.trim(), description, category: category.trim(), thumbnail })
    return created.id
  }

  async function onSave(e?: React.FormEvent) {
    e?.preventDefault()
    setErr(null); setMsg(null); setSaving(true)
    try {
      const idLocal = ebookId || (await ensureEbook())
      await updateEbookBasics(idLocal, { title: title.trim(), description, category: category.trim(), thumbnail })
      const n = Number(amountMajor)
      await updateEbookPricing(idLocal, {
        amountMajor: Number.isFinite(n) && n >= 0 ? n : 0,
        currency: currency as any,
        includedInMembership,
      })
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['myEbook', idLocal] }),
        qc.invalidateQueries({ queryKey: ['myEbookItems', idLocal] }),
      ])
      setMsg('Saved')
    } catch (e2: any) {
      setErr(e2?.response?.data?.message || e2?.message || 'Failed to save')
    } finally { setSaving(false) }
  }

  // thumbnail upload
  const thumbInputRef = useRef<HTMLInputElement|null>(null)
  const prevent = (e: any) => { e.preventDefault(); e.stopPropagation() }
  async function handleThumbFile(file: File) {
    if (!file.type.startsWith('image/')) { setErr('Please select an image'); return }
    setUploadingThumb(true)
    try { setThumbnail(await uploadToServer(file)) }
    catch { setErr('Thumbnail upload failed') }
    finally { setUploadingThumb(false) }
  }
  function onThumbDrop(e: React.DragEvent) { prevent(e); const f = e.dataTransfer.files?.[0]; if (f) void handleThumbFile(f) }
  function onThumbPick(e: React.ChangeEvent<HTMLInputElement>) { const f = e.target.files?.[0]; if (f) void handleThumbFile(f); (e.target as any).value = '' }

  const isPublished = ebookId && ebook?.status === 'published'
  const isArchived  = ebookId && ebook?.status === 'archived'

  return (
    <form onSubmit={onSave} className="mx-auto max-w-5xl px-3 sm:px-4 py-4 sm:py-6 space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold">{ebookId ? ebook?.title || 'Edit ebook' : 'Create an ebook'}</h1>
          {ebookId && <div className="text-xs sm:text-sm text-gray-500 break-all">{ebook?.slug}</div>}
          {ebookId && (
            <div className="text-xs sm:text-sm text-gray-500">
              Status: <span className="font-medium">{ebook?.status}</span> · Price:{' '}
              <span className="font-medium">{pricePretty(ebook?.pricing)}</span>
              {ebook?.pricing?.includedInMembership ? ' · In membership' : ''}
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/instructor/ebooks" className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50">Back</Link>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[1.25fr,0.95fr]">
        {/* Left */}
        <div className="order-2 md:order-1 space-y-4 rounded-md border bg-white p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">Title
              <input className="mt-1 w-full h-10 rounded-md border px-3" value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Ebook title" />
            </label>
            <label className="text-sm">Category
              <input className="mt-1 w-full h-10 rounded-md border px-3" value={category} onChange={(e)=>setCategory(e.target.value)} placeholder="ucat" />
            </label>
          </div>

          <label className="text-sm block">Description
            <textarea className="mt-1 w-full min-h-28 rounded-md border px-3 py-2" value={description} onChange={(e)=>setDescription(e.target.value)} placeholder="Describe what’s inside this ebook…" />
          </label>

          <ItemsEditor
            ebookId={ebookId}
            items={items}
            loading={loadingItems}
            fetching={fetchingItems}
            ensureEbook={ensureEbook}
            onCreated={() => qc.invalidateQueries({ queryKey: ['myEbookItems', ebookId] })}
            onReordered={() => qc.invalidateQueries({ queryKey: ['myEbookItems', ebookId] })}
            onChanged={() => qc.invalidateQueries({ queryKey: ['myEbookItems', ebookId] })}
          />
        </div>

        {/* Right */}
        <div className="order-1 md:order-2 space-y-3">
          {/* Thumbnail */}
          <div className="rounded-md border border-dashed bg-white p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm font-medium">Thumbnail</div>
              {thumbnail && <button type="button" onClick={()=>setThumbnail('')} className="text-xs text-red-600 hover:underline">Remove</button>}
            </div>

            <div className="mt-3 flex flex-col sm:flex-row sm:items-start gap-3">
              <div onDragEnter={prevent} onDragOver={prevent} onDragLeave={prevent} onDrop={onThumbDrop}
                   className="relative w-full sm:w-48 h-24 sm:h-28 md:h-36 rounded-md overflow-hidden bg-gray-50 border" title="Drop an image here">
                {thumbnail ? <img src={thumbnail} alt="thumbnail" className="absolute inset-0 w-full h-full object-cover" />
                           : <div className="absolute inset-0 grid place-items-center text-[11px] text-gray-500 px-2 text-center">Drag & drop image</div>}
              </div>

              <div className="flex-1 min-w-[240px]">
                <input className="w-full h-10 rounded-md border px-3" value={thumbnail} onChange={(e)=>setThumbnail(e.target.value)} placeholder="or paste an image URL…" />
                <div className="mt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input ref={thumbInputRef} type="file" accept="image/*" className="hidden" onChange={onThumbPick} />
                  <Button type="button" onClick={()=>thumbInputRef.current?.click()} disabled={uploadingThumb} className="w-full sm:w-auto">
                    {uploadingThumb ? 'Uploading…' : thumbnail ? 'Replace…' : 'Upload image'}
                  </Button>
                  <span className="text-[11px] text-gray-500 sm:ml-1">Recommended ~320×180 (16:9).</span>
                </div>
                <p className="mt-1 text-[11px] text-gray-500">Upload uses <code>/uploads</code>. We store the returned URL in <code>thumbnail</code>.</p>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="rounded-md border bg-white p-4 sm:p-5 space-y-3">
            <div className="text-sm font-medium">Pricing</div>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="text-sm">Price (major)
                <input className="mt-1 w-full h-10 rounded-md border px-3" value={amountMajor} onChange={(e)=>setAmountMajor(e.target.value)} placeholder="0.00 for Free" />
              </label>
              <label className="text-sm">Currency
                <select className="mt-1 w-full h-10 rounded-md border px-3" value={currency} onChange={(e)=>setCurrency(e.target.value)}>
                  {CURRENCIES.map(c=> <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <label className="text-sm inline-flex items-center gap-2 mt-6 sm:mt-6">
                <input type="checkbox" checked={includedInMembership} onChange={(e)=>setIncludedInMembership(e.target.checked)} />
                <span>Included in membership</span>
              </label>
            </div>
          </div>

          {/* Current status */}
          {ebookId && (
            <div className="rounded-md border bg-white p-3 text-sm">
              <div> Status: <b>{ebook?.status}</b> {ebook?.publishedAt ? ` · Published ${new Date(ebook.publishedAt).toLocaleString()}` : ''}</div>
              <div> Current price: <b>{pricePretty(ebook?.pricing)}</b>{ebook?.pricing?.includedInMembership ? ' · In membership' : ''}</div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" disabled={saving}>{saving ? 'Saving…' : ebookId ? 'Save' : 'Create'}</Button>

        {ebookId && ebook?.status !== 'published' && (
          <Button variant="secondary" onClick={()=>mPublish.mutate()} disabled={mPublish.isPending}>
            {mPublish.isPending ? 'Publishing…' : 'Publish'}
          </Button>
        )}
        {ebookId && ebook?.status === 'published' && (
          <Button variant="ghost" onClick={()=>mUnpublish.mutate()} disabled={mUnpublish.isPending}>
            {mUnpublish.isPending ? 'Unpublishing…' : 'Unpublish'}
          </Button>
        )}
        {ebookId && ebook?.status !== 'archived' && (
          <Button variant="ghost" onClick={()=>mArchive.mutate()} disabled={mArchive.isPending}>
            {mArchive.isPending ? 'Archiving…' : 'Archive'}
          </Button>
        )}
        {ebookId && ebook?.status === 'archived' && (
          <Button variant="ghost" onClick={()=>mRestore.mutate()} disabled={mRestore.isPending}>
            {mRestore.isPending ? 'Restoring…' : 'Restore'}
          </Button>
        )}
        {ebookId && (
          <Button variant="ghost" onClick={()=>{ if (confirm('Delete draft? This cannot be undone.')) mDelete.mutate() }} disabled={mDelete.isPending}>
            {mDelete.isPending ? 'Deleting…' : 'Delete'}
          </Button>
        )}

        {msg && <span className="text-sm text-green-700">{msg}</span>}
        {err && <span className="text-sm text-red-600">{err}</span>}
      </div>

      {ebookId && loadingRes && <div className="p-2 text-sm">Loading…</div>}
    </form>
  )
}

/* ---------------- Items Editor (ebooks) ---------------- */
function ItemsEditor({ ebookId, items, loading, fetching, ensureEbook, onCreated, onReordered, onChanged }:{
  ebookId: string|null
  items: any[]
  loading: boolean
  fetching: boolean
  ensureEbook: () => Promise<string>
  onCreated?: () => void
  onReordered?: () => void
  onChanged?: () => void
}) {
  const qc = useQueryClient()
  const [tab, setTab] = useState<'link'|'file'>('file')
  const [title, setTitle] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [linkNote, setLinkNote] = useState('')
  const [fileUrl, setFileUrl] = useState('')
  const [fileName, setFileName] = useState('')
  const [busy, setBusy] = useState(false)
  const fileInputRef = useRef<HTMLInputElement|null>(null)
  const prevent = (e:any) => { e.preventDefault(); e.stopPropagation() }

  async function addItem() {
    if (!title.trim()) return
    setBusy(true)
    try {
      const id = ebookId || (await ensureEbook())
      if (tab === 'link') {
        if (!linkUrl.trim()) return
        await createEbookItem(id, { title: title.trim(), type:'link', link: { url: linkUrl.trim(), note: linkNote.trim() } } as any)
      } else {
        if (!fileUrl.trim()) return
        await createEbookItem(id, { title: title.trim(), type:'file', file: { url: fileUrl.trim(), fileName: fileName.trim() || undefined } } as any)
      }
      setTitle(''); setLinkUrl(''); setLinkNote(''); setFileUrl(''); setFileName('')
      await qc.invalidateQueries({ queryKey: ['myEbookItems', id] })
      onCreated?.()
    } finally { setBusy(false) }
  }

  async function handleDroppedFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList || [])
    if (!files.length) return
    setBusy(true)
    try {
      const id = ebookId || (await ensureEbook())
      for (const f of files) {
        const url = await uploadToServer(f)
        await createEbookItem(id, { title: f.name, type:'file', file: { url, fileName: f.name, size: f.size, mimeType: f.type } } as any)
      }
      setFileUrl(''); setFileName('')
      await qc.invalidateQueries({ queryKey: ['myEbookItems', id] })
      onCreated?.()
    } finally { setBusy(false) }
  }

  function onDrop(e: React.DragEvent) { prevent(e); void handleDroppedFiles(e.dataTransfer.files as any) }
  function onPick(e: React.ChangeEvent<HTMLInputElement>) { const fs = e.target.files; void handleDroppedFiles(fs as any); (e.target as any).value = '' }

  // reorder
  const [dragId, setDragId] = useState<string|null>(null)
  function onDragStart(id: string) { setDragId(id) }
  function onDragOver(e: React.DragEvent) { e.preventDefault() }
  async function onDropItem(idTarget: string) {
    if (!dragId || dragId === idTarget) return
    const ids = items.map(i => i.id)
    const from = ids.indexOf(dragId)
    const to = ids.indexOf(idTarget)
    const reordered = [...ids]; const [moved] = reordered.splice(from,1); reordered.splice(to,0,moved)
    const id = ebookId || (await ensureEbook())
    await reorderEbookItems(id, reordered)
    setDragId(null)
    await qc.invalidateQueries({ queryKey: ['myEbookItems', id] })
    onReordered?.()
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-sm font-medium">Items</h3>
        <div className="inline-flex rounded-md border overflow-hidden">
          <button type="button" className={`px-3 py-1.5 text-sm ${tab === 'link' ? 'bg-gray-900 text-white':'bg-white'}`} onClick={()=>setTab('link')}>+ Link</button>
          <button type="button" className={`px-3 py-1.5 text-sm ${tab === 'file' ? 'bg-gray-900 text-white':'bg-white'}`} onClick={()=>setTab('file')}>+ File</button>
        </div>
      </div>

      {tab === 'link' ? (
        <div className="grid gap-2 sm:grid-cols-3">
          <input className="h-10 rounded-md border px-3" placeholder="Title" value={title} onChange={(e)=>setTitle(e.target.value)} />
          <input className="h-10 rounded-md border px-3" placeholder="https://…" value={linkUrl} onChange={(e)=>setLinkUrl(e.target.value)} />
          <div className="flex gap-2">
            <input className="h-10 flex-1 rounded-md border px-3" placeholder="Note (optional)" value={linkNote} onChange={(e)=>setLinkNote(e.target.value)} />
            <Button type="button" onClick={addItem} disabled={busy}>Add</Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-3">
          <input className="h-10 rounded-md border px-3" placeholder="Title" value={title} onChange={(e)=>setTitle(e.target.value)} />
          <input className="h-10 rounded-md border px-3" placeholder="File URL (/uploads…)" value={fileUrl} onChange={(e)=>setFileUrl(e.target.value)} />
          <div className="flex gap-2">
            <input className="h-10 w-40 rounded-md border px-3" placeholder="File name" value={fileName} onChange={(e)=>setFileName(e.target.value)} />
            <Button type="button" onClick={addItem} disabled={busy}>Add</Button>
          </div>
        </div>
      )}

      <div onDragEnter={prevent} onDragOver={prevent} onDragLeave={prevent} onDrop={onDrop}
           className="rounded-md border border-dashed p-3 text-xs text-gray-600">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div><b>Drop files here</b> to upload as items (uses <code>/uploads</code>).</div>
          <div className="flex items-center gap-2">
            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={onPick} />
            <Button type="button" variant="ghost" onClick={()=>fileInputRef.current?.click()}>Choose files…</Button>
            {busy && <span>Uploading…</span>}
          </div>
        </div>
      </div>

      {loading || fetching ? (
        <div className="rounded-md border p-3 text-sm">Loading items…</div>
      ) : items.length === 0 ? (
        <div className="rounded-md border p-3 text-sm text-gray-600">No items yet</div>
      ) : (
        <ul className="space-y-2">
          {items.map((it:any)=>(
            <li key={it.id} draggable onDragStart={()=>onDragStart(it.id)} onDragOver={onDragOver} onDrop={()=>onDropItem(it.id)}
                className="flex flex-col sm:flex-row sm:items-center gap-2 rounded-md border bg-white p-2">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{it.title}</div>
                <div className="text-xs text-gray-600 truncate">
                  {it.type === 'link' ? `🔗 ${it.link?.url}` : `📄 ${it.file?.fileName || it.file?.url}`}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button type="button" variant="ghost" onClick={async()=>{
                  const nt = prompt('Edit title', it.title) ?? it.title
                  if (nt && nt !== it.title) {
                    const id = ebookId || (await ensureEbook())
                    await updateEbookItem(id, it.id, { title: nt } as any)
                    onChanged?.()
                  }
                }}>Edit</Button>
                <Button type="button" variant="ghost" onClick={async()=>{
                  if (confirm('Delete item?')) {
                    const id = ebookId || (await ensureEbook())
                    await deleteEbookItem(id, it.id)
                    onChanged?.()
                  }
                }}>Delete</Button>
                <span className="cursor-grab select-none text-xs text-gray-500">⠿</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
