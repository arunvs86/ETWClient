import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Button from '@/components/ui/Button'
import { api } from '@/lib/api';

import {
  createDraftResource,
  getMyResource,
  updateResourceBasics,
  updateResourcePricing,
  publishResource,
  unpublishResource,
  archiveResource,
  restoreResource,
  deleteResource,
  listResourceItems,
  createResourceItem,
  updateResourceItem,
  deleteResourceItem,
  reorderResourceItems,
} from '@/lib/instructorResources.api'

const CURRENCIES = ['GBP', 'USD', 'EUR']

function pricePretty(p) {
  if (!p || p.isFree || !p.amountMinor) return 'Free'
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: p.currency || 'GBP' }).format(
      (p.amountMinor || 0) / 100
    )
  } catch {
    const amount = (p.amountMinor || 0) / 100
    return `${amount.toFixed(2)} ${p.currency || ''}`
  }
}

async function uploadToServer(file) {
    const fd = new FormData();
    fd.append('file', file);
  
    // Use the shared axios instance so baseURL = http://localhost:4000 (or your env)
    const { data } = await api.post('/uploads', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
      withCredentials: true,
    });
  
    const url =
      data?.url ||
      data?.fileUrl ||
      data?.location ||
      data?.href ||
      data?.path;
  
    if (!url) throw new Error('Upload response missing url');
  
    // If backend returns a relative path, normalize it to absolute using api baseURL
    if (/^https?:\/\//i.test(url)) return url;
    const base = (api.defaults.baseURL || '').replace(/\/$/, '');
    const rel  = url.startsWith('/') ? url : `/${url}`;
    return `${base}${rel}`;
  }

export default function ResourceUpsertPage() {
  const { id } = useParams()
  const nav = useNavigate()
  const qc = useQueryClient()

  const [resourceId, setResourceId] = useState(id || null)

  const { data, isLoading: loadingRes } = useQuery({
    queryKey: ['myResource', resourceId],
    queryFn: () => getMyResource(resourceId),
    enabled: !!resourceId,
    staleTime: 10_000,
  })

  const resource = data?.resource
  const { data: items = [], isLoading: loadingItems, isFetching: fetchingItems } = useQuery({
    queryKey: ['myResourceItems', resourceId],
    queryFn: () => listResourceItems(resourceId),
    enabled: !!resourceId,
    staleTime: 10_000,
  })

  // ---------------- form state ----------------
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [thumbnail, setThumbnail] = useState('')

  const [amountMajor, setAmountMajor] = useState('0')
  const [currency, setCurrency] = useState('GBP')
  const [includedInMembership, setIncludedInMembership] = useState(true)

  const [saving, setSaving] = useState(false)
  const [uploadingThumb, setUploadingThumb] = useState(false)
  const [msg, setMsg] = useState(null)
  const [err, setErr] = useState(null)

  useEffect(() => {
    if (!resource) return
    setTitle(resource.title || '')
    setDescription(resource.description || '')
    setCategory(resource.category || '')
    setThumbnail(resource.thumbnail || '')
    const p = resource.pricing || {}
    setAmountMajor(((p.amountMinor || 0) / 100).toFixed(2))
    setCurrency(p.currency || 'GBP')
    setIncludedInMembership(!!p.includedInMembership)
  }, [resource])

  // ---------------- publish/archive etc ----------------
  const mPublish = useMutation({
    mutationFn: () => publishResource(resourceId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['myResource', resourceId] }),
  })
  const mUnpublish = useMutation({
    mutationFn: () => unpublishResource(resourceId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['myResource', resourceId] }),
  })
  const mArchive = useMutation({
    mutationFn: () => archiveResource(resourceId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['myResource', resourceId] }),
  })
  const mRestore = useMutation({
    mutationFn: () => restoreResource(resourceId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['myResource', resourceId] }),
  })
  const mDelete = useMutation({
    mutationFn: () => deleteResource(resourceId),
    onSuccess: () => nav('/instructor/resources'),
  })

  // ---------------- ensureResource(): auto-create draft on demand ----------------
  const ensureResource = async () => {
    if (resourceId) return resourceId
    if (!title.trim()) throw new Error('Please enter a title before adding items.')
    const created = await createDraftResource({ title: title.trim() })
    setResourceId(created.id)
    // update URL so future queries load correctly
    nav(`/instructor/resources/${created.id}`, { replace: true })
    // also persist current basics quickly (optional)
    await updateResourceBasics(created.id, {
      title: title.trim(),
      description,
      category: category.trim(),
      thumbnail,
    })
    return created.id
  }

  // ---------------- Save (explicit) ----------------
  async function onSave(e) {
    e?.preventDefault()
    setErr(null)
    setMsg(null)
    setSaving(true)
    try {
      const idLocal = resourceId || (await ensureResource())
      await updateResourceBasics(idLocal, {
        title: title.trim(),
        description,
        category: category.trim(),
        thumbnail,
      })
      const n = Number(amountMajor)
      await updateResourcePricing(idLocal, {
        amountMajor: Number.isFinite(n) && n >= 0 ? n : 0,
        currency,
        includedInMembership,
      })
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['myResource', idLocal] }),
        qc.invalidateQueries({ queryKey: ['myResourceItems', idLocal] }),
      ])
      setMsg('Saved')
    } catch (e2) {
      setErr(e2?.response?.data?.message || e2?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  // ---------------- thumbnail upload ----------------
  const thumbInputRef = useRef(null)
  const prevent = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }
  async function handleThumbFile(file) {
    if (!file.type.startsWith('image/')) {
      setErr('Please select an image')
      return
    }
    setUploadingThumb(true)
    try {
      const url = await uploadToServer(file)
      setThumbnail(url)
    } catch {
      setErr('Thumbnail upload failed')
    } finally {
      setUploadingThumb(false)
    }
  }
  function onThumbDrop(e) {
    prevent(e)
    const file = e.dataTransfer.files?.[0]
    if (file) void handleThumbFile(file)
  }
  function onThumbPick(e) {
    const file = e.target.files?.[0]
    if (file) void handleThumbFile(file)
    e.target.value = ''
  }

  const isPublished = resourceId && resource?.status === 'published'
  const isArchived = resourceId && resource?.status === 'archived'

  return (
    <form onSubmit={onSave} className="mx-auto max-w-5xl px-3 sm:px-4 py-4 sm:py-6 space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold">
            {resourceId ? resource?.title || 'Edit resource' : 'Create a resource'}
          </h1>
          {resourceId && <div className="text-xs sm:text-sm text-gray-500 break-all">{resource?.slug}</div>}
          {resourceId && (
            <div className="text-xs sm:text-sm text-gray-500">
              Status: <span className="font-medium">{resource?.status}</span> · Price:{' '}
              <span className="font-medium">{pricePretty(resource?.pricing)}</span>
              {resource?.pricing?.includedInMembership ? ' · In membership' : ''}
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/instructor/resources" className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50">
            Back
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[1.25fr,0.95fr]">
        {/* Left */}
        <div className="order-2 md:order-1 space-y-4 rounded-md border bg-white p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              Title
              <input
                className="mt-1 w-full h-10 rounded-md border px-3"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Resource pack title"
              />
            </label>
            <label className="text-sm">
              Category
              <input
                className="mt-1 w-full h-10 rounded-md border px-3"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="ucat"
              />
            </label>
          </div>

          <label className="text-sm block">
            Description
            <textarea
              className="mt-1 w-full min-h-28 rounded-md border px-3 py-2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what's inside this resource pack…"
            />
          </label>

          <ItemsEditor
            resourceId={resourceId}
            items={items}
            loading={loadingItems}
            fetching={fetchingItems}
            ensureResource={ensureResource}
            onCreated={() => qc.invalidateQueries({ queryKey: ['myResourceItems', resourceId] })}
            onReordered={() => qc.invalidateQueries({ queryKey: ['myResourceItems', resourceId] })}
            onChanged={() => qc.invalidateQueries({ queryKey: ['myResourceItems', resourceId] })}
          />
        </div>

        {/* Right */}
        <div className="order-1 md:order-2 space-y-3">
          {/* Thumbnail */}
          <div className="rounded-md border border-dashed bg-white p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm font-medium">Thumbnail</div>
              {thumbnail && (
                <button type="button" onClick={() => setThumbnail('')} className="text-xs text-red-600 hover:underline">
                  Remove
                </button>
              )}
            </div>

            <div className="mt-3 flex flex-col sm:flex-row sm:items-start gap-3">
              <div
                onDragEnter={prevent}
                onDragOver={prevent}
                onDragLeave={prevent}
                onDrop={onThumbDrop}
                className="relative w-full sm:w-48 h-24 sm:h-28 md:h-36 rounded-md overflow-hidden bg-gray-50 border"
                title="Drop an image here"
              >
                {thumbnail ? (
                  <img src={thumbnail} alt="thumbnail" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 grid place-items-center text-[11px] text-gray-500 px-2 text-center">
                    Drag & drop image
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-[240px]">
                <input
                  className="w-full h-10 rounded-md border px-3"
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  placeholder="or paste an image URL…"
                />

                <div className="mt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input ref={thumbInputRef} type="file" accept="image/*" className="hidden" onChange={onThumbPick} />
                  <Button type="button" onClick={() => thumbInputRef.current?.click()} disabled={uploadingThumb} className="w-full sm:w-auto">
                    {uploadingThumb ? 'Uploading…' : thumbnail ? 'Replace…' : 'Upload image'}
                  </Button>
                  <span className="text-[11px] text-gray-500 sm:ml-1">Recommended ~320×180 (16:9).</span>
                </div>

                <p className="mt-1 text-[11px] text-gray-500">
                  Upload uses <code>/uploads</code>. We store the returned URL in <code>thumbnail</code>.
                </p>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="rounded-md border bg-white p-4 sm:p-5 space-y-3">
            <div className="text-sm font-medium">Pricing</div>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="text-sm">
                Price (major)
                <input
                  className="mt-1 w-full h-10 rounded-md border px-3"
                  value={amountMajor}
                  onChange={(e) => setAmountMajor(e.target.value)}
                  placeholder="0.00 for Free"
                />
              </label>
              <label className="text-sm">
                Currency
                <select
                  className="mt-1 w-full h-10 rounded-md border px-3"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm inline-flex items-center gap-2 mt-6 sm:mt-6">
                <input
                  type="checkbox"
                  checked={includedInMembership}
                  onChange={(e) => setIncludedInMembership(e.target.checked)}
                />
                <span>Included in membership</span>
              </label>
            </div>
          </div>

          {/* Current status */}
          {resourceId && (
            <div className="rounded-md border bg-white p-3 text-sm">
              <div>
                Status: <b>{resource?.status}</b>
                {resource?.publishedAt ? ` · Published ${new Date(resource.publishedAt).toLocaleString()}` : ''}
              </div>
              <div>
                Current price: <b>{pricePretty(resource?.pricing)}</b>
                {resource?.pricing?.includedInMembership ? ' · In membership' : ''}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : resourceId ? 'Save' : 'Create'}
        </Button>

        {resourceId && resource?.status !== 'published' && (
          <Button variant="secondary" onClick={() => mPublish.mutate()} disabled={mPublish.isPending}>
            {mPublish.isPending ? 'Publishing…' : 'Publish'}
          </Button>
        )}
        {resourceId && resource?.status === 'published' && (
          <Button variant="ghost" onClick={() => mUnpublish.mutate()} disabled={mUnpublish.isPending}>
            {mUnpublish.isPending ? 'Unpublishing…' : 'Unpublish'}
          </Button>
        )}
        {resourceId && resource?.status !== 'archived' && (
          <Button variant="ghost" onClick={() => mArchive.mutate()} disabled={mArchive.isPending}>
            {mArchive.isPending ? 'Archiving…' : 'Archive'}
          </Button>
        )}
        {resourceId && resource?.status === 'archived' && (
          <Button variant="ghost" onClick={() => mRestore.mutate()} disabled={mRestore.isPending}>
            {mRestore.isPending ? 'Restoring…' : 'Restore'}
          </Button>
        )}
        {resourceId && (
          <Button
            variant="ghost"
            onClick={() => {
              if (confirm('Delete draft? This cannot be undone.')) mDelete.mutate()
            }}
            disabled={mDelete.isPending}
          >
            {mDelete.isPending ? 'Deleting…' : 'Delete'}
          </Button>
        )}

        {msg && <span className="text-sm text-green-700">{msg}</span>}
        {err && <span className="text-sm text-red-600">{err}</span>}
      </div>

      {resourceId && loadingRes && <div className="p-2 text-sm">Loading…</div>}
    </form>
  )
}

/* ------------------------------------------------------------------------------------
 * Items Editor (now auto-creates resource via ensureResource())
 * ----------------------------------------------------------------------------------*/
function ItemsEditor({ resourceId, items, loading, fetching, ensureResource, onCreated, onReordered, onChanged }) {
  const qc = useQueryClient();                      // NEW
  const [tab, setTab] = useState('link');
  const [title, setTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkNote, setLinkNote] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef(null);
  const prevent = (e) => { e.preventDefault(); e.stopPropagation(); };

  async function addItem() {
    if (!title.trim()) return;
    setBusy(true);
    try {
      const id = resourceId || (await ensureResource());   // ensure draft exists
      if (tab === 'link') {
        if (!linkUrl.trim()) return;
        await createResourceItem(id, { title: title.trim(), type: 'link', link: { url: linkUrl.trim(), note: linkNote.trim() } });
      } else {
        if (!fileUrl.trim()) return;
        await createResourceItem(id, { title: title.trim(), type: 'file', file: { url: fileUrl.trim(), fileName: fileName.trim() || undefined } });
      }
      // clear inputs (both modes)
      setTitle(''); setLinkUrl(''); setLinkNote(''); setFileUrl(''); setFileName('');
      await qc.invalidateQueries({ queryKey: ['myResourceItems', id] });   // RIGHT KEY
      onCreated?.();
    } finally { setBusy(false); }
  }

  async function handleDroppedFiles(fileList) {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    setBusy(true);
    try {
      const id = resourceId || (await ensureResource());
      for (const f of files) {
        const url = await uploadToServer(f);
        await createResourceItem(id, { title: f.name, type: 'file', file: { url, fileName: f.name, size: f.size, mimeType: f.type } });
      }
      // clear file URL inputs if user had typed them
      setFileUrl(''); setFileName('');
      await qc.invalidateQueries({ queryKey: ['myResourceItems', id] });
      onCreated?.();
    } finally { setBusy(false); }
  }

  function onDrop(e) { prevent(e); void handleDroppedFiles(e.dataTransfer.files); }
  function onPick(e) { const fs = e.target.files; void handleDroppedFiles(fs); e.target.value = ''; }

  // reorder (same idea: ensure id + invalidate right key)
  const [dragId, setDragId] = useState(null);
  function onDragStart(id) { setDragId(id); }
  function onDragOver(e) { e.preventDefault(); }
  async function onDropItem(idTarget) {
    if (!dragId || dragId === idTarget) return;
    const ids = items.map(i => i.id);
    const from = ids.indexOf(dragId);
    const to = ids.indexOf(idTarget);
    const reordered = [...ids]; const [moved] = reordered.splice(from, 1); reordered.splice(to, 0, moved);
    const id = resourceId || (await ensureResource());
    await reorderResourceItems(id, reordered);
    setDragId(null);
    await qc.invalidateQueries({ queryKey: ['myResourceItems', id] });
    onReordered?.();
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-sm font-medium">Items</h3>

        <div className="inline-flex rounded-md border overflow-hidden">
          <button
            type="button"
            className={`px-3 py-1.5 text-sm ${tab === 'link' ? 'bg-gray-900 text-white' : 'bg-white'}`}
            onClick={() => setTab('link')}
          >
            + Link
          </button>
          <button
            type="button"
            className={`px-3 py-1.5 text-sm ${tab === 'file' ? 'bg-gray-900 text-white' : 'bg-white'}`}
            onClick={() => setTab('file')}
          >
            + File
          </button>
        </div>
      </div>

      {/* New item row */}
      {tab === 'link' ? (
        <div className="grid gap-2 sm:grid-cols-3">
          <input className="h-10 rounded-md border px-3" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <input className="h-10 rounded-md border px-3" placeholder="https://…" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} />
          <div className="flex gap-2">
            <input className="h-10 flex-1 rounded-md border px-3" placeholder="Note (optional)" value={linkNote} onChange={(e) => setLinkNote(e.target.value)} />
            <Button type="button" onClick={addItem} disabled={busy}>Add</Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-3">
          <input className="h-10 rounded-md border px-3" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <input className="h-10 rounded-md border px-3" placeholder="File URL (/uploads…)" value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} />
          <div className="flex gap-2">
            <input className="h-10 w-40 rounded-md border px-3" placeholder="File name" value={fileName} onChange={(e) => setFileName(e.target.value)} />
            <Button type="button" onClick={addItem} disabled={busy}>Add</Button>
          </div>
        </div>
      )}

      {/* Drag & drop upload zone */}
      <div
        onDragEnter={prevent}
        onDragOver={prevent}
        onDragLeave={prevent}
        onDrop={onDrop}
        className="rounded-md border border-dashed p-3 text-xs text-gray-600"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div><b>Drop files here</b> to upload as items (uses <code>/uploads</code>).</div>
          <div className="flex items-center gap-2">
            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={onPick} />
            <Button type="button" variant="ghost" onClick={() => fileInputRef.current?.click()}>
              Choose files…
            </Button>
            {busy && <span>Uploading…</span>}
          </div>
        </div>
      </div>

      {/* Items list */}
      {loading || fetching ? (
        <div className="rounded-md border p-3 text-sm">Loading items…</div>
      ) : items.length === 0 ? (
        <div className="rounded-md border p-3 text-sm text-gray-600">No items yet</div>
      ) : (
        <ul className="space-y-2">
          {items.map((it) => (
            <li
              key={it.id}
              draggable
              onDragStart={() => onDragStart(it.id)}
              onDragOver={onDragOver}
              onDrop={() => onDropItem(it.id)}
              className="flex flex-col sm:flex-row sm:items-center gap-2 rounded-md border bg-white p-2"
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{it.title}</div>
                <div className="text-xs text-gray-600 truncate">
                  {it.type === 'link' ? `🔗 ${it.link?.url}` : `📄 ${it.file?.fileName || it.file?.url}`}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={async () => {
                    const nt = prompt('Edit title', it.title) ?? it.title
                    if (nt && nt !== it.title) {
                      const id = resourceId || (await ensureResource())
                      await updateResourceItem(id, it.id, { title: nt })
                      onChanged?.()
                    }
                  }}
                >
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={async () => {
                    if (confirm('Delete item?')) {
                      const id = resourceId || (await ensureResource())
                      await deleteResourceItem(id, it.id)
                      onChanged?.()
                    }
                  }}
                >
                  Delete
                </Button>
                <span className="cursor-grab select-none text-xs text-gray-500">⠿</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
