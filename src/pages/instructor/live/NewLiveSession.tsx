import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/ui/Button'
import { createLiveSession, type Currency } from '@/lib/liveSessions.api'

function localDatetimeMin(): string {
  const d = new Date(Date.now() + 60_000)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function NewLiveSession() {
  const nav = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startAt, setStartAt] = useState('')
  const [endAt, setEndAt] = useState('')
  const [pricingType, setPricingType] = useState<'free'|'paid'>('free')
  const [amountMajor, setAmountMajor] = useState<string>('0')
  const [currency, setCurrency] = useState<Currency>('GBP')
  const [membersAccess, setMembersAccess] = useState<'free'|'paid'|'none'>('none')
  const [thumbnail, setThumbnail] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [minDT, setMinDT] = useState(localDatetimeMin())
  const dropRef = useRef<HTMLDivElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [zoomJoinUrl, setZoomJoinUrl] = useState('');
  const [zoomPasscode, setZoomPasscode] = useState('');
  
  useEffect(() => {
    const t = setInterval(() => setMinDT(localDatetimeMin()), 60_000)
    return () => clearInterval(t)
  }, [])

  const preventDefaults = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); }

  const readImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) { setErr('Please select an image'); return }
    const reader = new FileReader()
    reader.onload = () => setThumbnail(String(reader.result || ''))
    reader.onerror = () => setErr('Failed to read image')
    reader.readAsDataURL(file)
  }

  const onDrop = (e: React.DragEvent) => {
    preventDefaults(e)
    const file = e.dataTransfer.files?.[0]
    if (file) readImageFile(file)
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) readImageFile(file)
    e.target.value = ''
  }

  const openFilePicker = () => fileInputRef.current?.click()
  const clearThumbnail = () => setThumbnail('')

  function looksLikeZoomUrl(u: string) {
    try {
      const url = new URL(u);
      const h = url.host.toLowerCase();
      return /^https:$/i.test(url.protocol) &&
        (h === 'zoom.us' || h.endsWith('.zoom.us') || h === 'app.zoom.us');
    } catch {
      return false;
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    console.log("title", title)
    if (!title.trim()) { setErr('Title is required'); return }
    if (!startAt || !endAt) { setErr('Start and End are required'); return }
    const now = new Date()
    const start = new Date(startAt)
    const end = new Date(endAt)
    if (start <= now) { setErr('Start time must be in the future'); return }
    if (end <= start) { setErr('End must be after Start'); return }
    if (pricingType === 'paid' && (!amountMajor || Number(amountMajor) <= 0)) { setErr('Enter a price'); return }

    if (zoomJoinUrl && !looksLikeZoomUrl(zoomJoinUrl)) {
      setErr('Please paste a valid https Zoom link (zoom.us).');
      return;
    }
    
    setLoading(true)
    try {
      const amountMinor = pricingType === 'paid' ? Math.round(Number(amountMajor) * 100) : 0
      const s = await createLiveSession({
        title: title.trim(),
        description: description.trim(),
        startAt: start.toISOString(),
        endAt: end.toISOString(),
        pricing: { type: pricingType, amountMinor, currency },
        membersAccess,
        visibility: 'public',
        thumbnail: thumbnail.trim() || undefined,
        // ↓ NEW
        zoom: (zoomJoinUrl || zoomPasscode)
          ? { joinUrl: zoomJoinUrl.trim() || undefined, passcode: zoomPasscode.trim() || undefined }
          : undefined,
      });
      nav(`/live/${s.id}`)
    } catch (e: any) {
      setErr(e?.response?.data?.error || 'Failed to create session')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 space-y-5">
      <div className="rounded-2xl border bg-gradient-to-r from-indigo-50 to-violet-50 p-4 sm:p-5">
        <h2 className="text-lg sm:text-xl font-semibold">Create a live session</h2>
        <p className="text-xs sm:text-sm text-gray-700">Set the basics, price, and membership rule. You can edit later.</p>
      </div>

      {/* Responsive grid: 1 col on mobile, 2 cols on lg+ */}
      <form onSubmit={onSubmit} className="grid gap-5 lg:grid-cols-12">
        {/* Left – form */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4 rounded-2xl border bg-white p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">Title
              <input
                className="mt-1 w-full h-10 rounded-md border px-3"
                value={title}
                onChange={e=>setTitle(e.target.value)}
                placeholder="UCAT Live Q&A"
              />
            </label>
            <label className="text-sm">Pricing
              <select
                className="mt-1 w-full h-10 rounded-md border px-3"
                value={pricingType}
                onChange={e=>setPricingType(e.target.value as 'free'|'paid')}
              >
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>
            </label>
          </div>

          <label className="block text-sm">Description
            <textarea
              className="mt-1 w-full min-h-28 rounded-md border px-3 py-2"
              value={description}
              onChange={e=>setDescription(e.target.value)}
              placeholder="What will you cover?"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">Start (local)
              <input
                type="datetime-local"
                min={minDT}
                className="mt-1 w-full h-10 rounded-md border px-3"
                value={startAt}
                onChange={e=>setStartAt(e.target.value)}
              />
            </label>
            <label className="text-sm">End (local)
              <input
                type="datetime-local"
                min={startAt || minDT}
                className="mt-1 w-full h-10 rounded-md border px-3"
                value={endAt}
                onChange={e=>setEndAt(e.target.value)}
              />
            </label>
          </div>

          <div className="grid gap-3">
  <div className="text-sm font-medium">Zoom (optional)</div>

  <label className="text-sm">Zoom meeting link
    <input
      type="url"
      inputMode="url"
      className="mt-1 w-full h-10 rounded-md border px-3"
      placeholder="https://us02web.zoom.us/j/XXXXXXXXXX?pwd=..."
      value={zoomJoinUrl}
      onChange={e=>setZoomJoinUrl(e.target.value)}
    />
  </label>

  <label className="text-sm">Passcode (optional)
    <input
      className="mt-1 w-full h-10 rounded-md border px-3"
      placeholder="e.g., 123456"
      value={zoomPasscode}
      onChange={e=>setZoomPasscode(e.target.value)}
    />
  </label>

  <p className="text-[11px] text-gray-500">
    We’ll only share this link with entitled users and within the join window.
  </p>
</div>


          <div className="grid gap-3 sm:grid-cols-3">
            <label className="text-sm">Amount (major)
              <input
                className="mt-1 w-full h-10 rounded-md border px-3"
                value={amountMajor}
                onChange={e=>setAmountMajor(e.target.value)}
                disabled={pricingType!=='paid'}
                placeholder="10.00"
              />
            </label>
            <label className="text-sm">Currency
              <select
                className="mt-1 w-full h-10 rounded-md border px-3"
                value={currency}
                onChange={e=>setCurrency(e.target.value as Currency)}
                disabled={pricingType!=='paid'}
              >
                <option value="GBP">GBP</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </label>
            <label className="text-sm">Members access
              <select
                className="mt-1 w-full h-10 rounded-md border px-3"
                value={membersAccess}
                onChange={e=>setMembersAccess(e.target.value as any)}
              >
                <option value="none">None</option>
                <option value="free">Free for Members</option>
                <option value="paid">Members pay</option>
              </select>
            </label>
          </div>
        </div>

        {/* Right – thumbnail pane */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-3 rounded-2xl border bg-white p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Thumbnail</div>
            {thumbnail && (
              <button
                type="button"
                onClick={clearThumbnail}
                className="text-xs text-red-600 hover:underline"
              >
                Remove
              </button>
            )}
          </div>

          <div
            ref={dropRef}
            onDragEnter={preventDefaults}
            onDragOver={preventDefaults}
            onDragLeave={preventDefaults}
            onDrop={onDrop}
            className="rounded-md border border-dashed p-2 bg-gray-50"
          >
            {/* Compact, responsive preview */}
            <div className="h-24 sm:h-28 md:h-36 rounded-md overflow-hidden bg-white border">
              {thumbnail
                ? <img src={thumbnail} alt="thumbnail" className="w-full h-full object-cover" />
                : <div className="h-full w-full grid place-items-center text-xs text-gray-500">Drag & drop an image</div>}
            </div>

            <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-2">
              <Button type="button" onClick={openFilePicker} className="w-full sm:w-auto">
                Upload image
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onFileChange}
                className="hidden"
                aria-label="Choose thumbnail image"
              />
              <span className="text-xs text-gray-500 sm:ml-1">or paste an image URL:</span>
            </div>

            <input
              className="mt-2 w-full h-9 rounded-md border px-3 bg-white text-sm"
              value={thumbnail}
              onChange={(e)=>setThumbnail(e.target.value)}
              placeholder="https://…"
            />

            <p className="mt-1 text-[11px] text-gray-500">
              Tip: In dev, images are stored inline. In production, upload to storage and paste the URL.
            </p>
          </div>

          {err && <div className="text-sm text-red-600">{err}</div>}
        </div>

        {/* Submit — sits at bottom; full-width on mobile */}
        <div className="lg:col-span-12">
          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading ? 'Creating…' : 'Create session'}
          </Button>
        </div>
      </form>
    </div>
  )
}
