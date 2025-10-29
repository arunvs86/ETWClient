import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '@/components/ui/Button';
import {
  getLiveSession,
  updateLiveSession,
  type Currency,
  type MembersAccess,
} from '@/lib/liveSessions.api';

function toLocalInputValue(isoString: string | undefined) {
  if (!isoString) return '';
  const d = new Date(isoString);
  const pad = (n: number) => String(n).padStart(2, '0');
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function looksLikeZoomUrl(u: string) {
  try {
    const url = new URL(u);
    const h = url.host.toLowerCase();
    return (
      /^https:$/i.test(url.protocol) &&
      (h === 'zoom.us' || h.endsWith('.zoom.us') || h === 'app.zoom.us')
    );
  } catch {
    return false;
  }
}

export default function EditLiveSession() {
  const nav = useNavigate();
  const { id = '' } = useParams();

  // UI state
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');

  const [pricingType, setPricingType] = useState<'free' | 'paid'>('free');
  const [amountMajor, setAmountMajor] = useState<string>('0');
  const [currency, setCurrency] = useState<Currency>('GBP');

  const [membersAccess, setMembersAccess] = useState<MembersAccess>('none');

  const [thumbnail, setThumbnail] = useState<string>('');

  const [zoomJoinUrl, setZoomJoinUrl] = useState('');
  const [zoomPasscode, setZoomPasscode] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // drag/drop helpers
  function preventDefaults(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
  }
  function readImageFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setErr('Please select an image');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setThumbnail(String(reader.result || ''));
    reader.onerror = () => setErr('Failed to read image');
    reader.readAsDataURL(file);
  }
  function onDrop(e: React.DragEvent) {
    preventDefaults(e);
    const file = e.dataTransfer.files?.[0];
    if (file) readImageFile(file);
  }
  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) readImageFile(file);
    e.target.value = '';
  }
  function clearThumbnail() {
    setThumbnail('');
  }
  function openFilePicker() {
    fileInputRef.current?.click();
  }

  // load existing session
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const s = await getLiveSession(id);

        // required fields
        setTitle(s.title || '');
        setDescription(s.description || '');

        setStartAt(toLocalInputValue(s.startAt));
        setEndAt(toLocalInputValue(s.endAt));

        const pType = s.pricing?.type === 'paid' ? 'paid' : 'free';
        setPricingType(pType);

        const major = s.pricing?.amountMinor
          ? String((Number(s.pricing.amountMinor) || 0) / 100)
          : '0';
        setAmountMajor(major);

        setCurrency((s.pricing?.currency || 'GBP') as Currency);

        setMembersAccess((s.membersAccess || 'none') as MembersAccess);

        setThumbnail(s.thumbnail || '');

        // zoom isn't currently returned by mapPublic(), but let's be defensive
        setZoomJoinUrl(s.zoom?.joinUrl || '');
        setZoomPasscode(s.zoom?.passcode || '');
      } catch (e: any) {
        if (!mounted) return;
        setErr(e?.response?.data?.error || 'Failed to load session');
      } finally {
        if (mounted) setInitialLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (!title.trim()) {
      setErr('Title is required');
      return;
    }
    if (!startAt || !endAt) {
      setErr('Start and End are required');
      return;
    }

    const start = new Date(startAt);
    const end = new Date(endAt);
    if (end <= start) {
      setErr('End must be after Start');
      return;
    }

    if (pricingType === 'paid' && (!amountMajor || Number(amountMajor) <= 0)) {
      setErr('Enter a price');
      return;
    }

    if (zoomJoinUrl && !looksLikeZoomUrl(zoomJoinUrl)) {
      setErr('Please paste a valid https Zoom link (zoom.us).');
      return;
    }

    setLoading(true);
    try {
      const amountMinor =
        pricingType === 'paid'
          ? Math.round(Number(amountMajor) * 100)
          : 0;

      await updateLiveSession(id, {
        title: title.trim(),
        description: description.trim(),
        startAt: new Date(startAt).toISOString(),
        endAt: new Date(endAt).toISOString(),
        pricing: {
          type: pricingType,
          amountMinor,
          currency,
        },
        membersAccess,
        visibility: 'public', // you can later expose this in UI if you want
        thumbnail: thumbnail.trim() || '', // '' means "clear" on backend
        zoom:
          zoomJoinUrl || zoomPasscode
            ? {
                joinUrl: zoomJoinUrl.trim() || undefined,
                passcode: zoomPasscode.trim() || undefined,
              }
            : undefined,
      });

      nav(`/live/${id}`);
    } catch (e: any) {
      setErr(e?.response?.data?.error || 'Failed to update session');
    } finally {
      setLoading(false);
    }
  }

  if (initialLoading) {
    return (
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-10 text-center text-sm text-gray-600">
        Loading session…
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 space-y-5">
      <div className="rounded-2xl border bg-gradient-to-r from-indigo-50 to-violet-50 p-4 sm:p-5">
        <h2 className="text-lg sm:text-xl font-semibold">Edit live session</h2>
        <p className="text-xs sm:text-sm text-gray-700">
          Update details, price, access rules, or Zoom link.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="grid gap-5 lg:grid-cols-12"
      >
        {/* Left column */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4 rounded-2xl border bg-white p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              Title
              <input
                className="mt-1 w-full h-10 rounded-md border px-3"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="UCAT Live Q&A"
              />
            </label>

            <label className="text-sm">
              Pricing
              <select
                className="mt-1 w-full h-10 rounded-md border px-3"
                value={pricingType}
                onChange={(e) =>
                  setPricingType(e.target.value as 'free' | 'paid')
                }
              >
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>
            </label>
          </div>

          <label className="block text-sm">
            Description
            <textarea
              className="mt-1 w-full min-h-28 rounded-md border px-3 py-2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will you cover?"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              Start (local)
              <input
                type="datetime-local"
                className="mt-1 w-full h-10 rounded-md border px-3"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
              />
            </label>
            <label className="text-sm">
              End (local)
              <input
                type="datetime-local"
                className="mt-1 w-full h-10 rounded-md border px-3"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
              />
            </label>
          </div>

          <div className="grid gap-3">
            <div className="text-sm font-medium">Zoom (optional)</div>

            <label className="text-sm">
              Zoom meeting link
              <input
                type="url"
                inputMode="url"
                className="mt-1 w-full h-10 rounded-md border px-3"
                placeholder="https://us02web.zoom.us/j/XXXXXXXXXX?pwd=..."
                value={zoomJoinUrl}
                onChange={(e) => setZoomJoinUrl(e.target.value)}
              />
            </label>

            <label className="text-sm">
              Passcode (optional)
              <input
                className="mt-1 w-full h-10 rounded-md border px-3"
                placeholder="e.g., 123456"
                value={zoomPasscode}
                onChange={(e) => setZoomPasscode(e.target.value)}
              />
            </label>

            <p className="text-[11px] text-gray-500">
              Shown only to entitled users and only inside the join window.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <label className="text-sm">
              Amount (major)
              <input
                className="mt-1 w-full h-10 rounded-md border px-3"
                value={amountMajor}
                onChange={(e) => setAmountMajor(e.target.value)}
                disabled={pricingType !== 'paid'}
                placeholder="10.00"
              />
            </label>

            <label className="text-sm">
              Currency
              <select
                className="mt-1 w-full h-10 rounded-md border px-3"
                value={currency}
                onChange={(e) =>
                  setCurrency(e.target.value as Currency)
                }
                disabled={pricingType !== 'paid'}
              >
                <option value="GBP">GBP</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </label>

            <label className="text-sm">
              Members access
              <select
                className="mt-1 w-full h-10 rounded-md border px-3"
                value={membersAccess}
                onChange={(e) =>
                  setMembersAccess(e.target.value as MembersAccess)
                }
              >
                <option value="none">None</option>
                <option value="free">Free for Members</option>
                <option value="paid">Members pay</option>
              </select>
            </label>
          </div>

          {err && (
            <div className="text-sm text-red-600">{err}</div>
          )}
        </div>

        {/* Right column - thumbnail */}
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
            onDragEnter={preventDefaults}
            onDragOver={preventDefaults}
            onDragLeave={preventDefaults}
            onDrop={onDrop}
            className="rounded-md border border-dashed p-2 bg-gray-50"
          >
            <div className="h-24 sm:h-28 md:h-36 rounded-md overflow-hidden bg-white border">
              {thumbnail ? (
                <img
                  src={thumbnail}
                  alt="thumbnail"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="h-full w-full grid place-items-center text-xs text-gray-500">
                  Drag & drop an image
                </div>
              )}
            </div>

            <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-2">
              <Button
                type="button"
                onClick={openFilePicker}
                className="w-full sm:w-auto"
              >
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
              <span className="text-xs text-gray-500 sm:ml-1">
                or paste an image URL:
              </span>
            </div>

            <input
              className="mt-2 w-full h-9 rounded-md border px-3 bg-white text-sm"
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
              placeholder="https://… or data:image/...base64"
            />

            <p className="mt-1 text-[11px] text-gray-500">
              Paste https:// URL, or base64 `data:image/...`. Leave blank to
              clear.
            </p>
          </div>
        </div>

        <div className="lg:col-span-12">
          <Button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
