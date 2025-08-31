// src/pages/instructor/CourseUpsertPage.tsx
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getMyInstructorCourse,
  createDraftCourse,
  updateCourseBasics,
  updateCoursePricing,
  publishCourse,
  unpublishCourse,
  archiveCourse,
  restoreCourse,
  deleteCourse,
  upsertSingleLesson,
  type InstructorCourse,
} from '@/lib/instructorCourses.api';
import Button from '@/components/ui/Button';

type Level = 'beginner' | 'intermediate' | 'advanced';
type Currency = 'GBP' | 'USD' | 'EUR';

function PricePretty(p?: { amountMinor?: number; isFree?: boolean; currency?: Currency }) {
  if (!p || p.isFree || !p.amountMinor) return <>Free</>;
  const amount = (p.amountMinor || 0) / 100;
  try {
    return <>{new Intl.NumberFormat(undefined, { style: 'currency', currency: p.currency || 'GBP' }).format(amount)}</>;
  } catch { return <>{amount.toFixed(2)} {p.currency || ''}</>; }
}

export default function CourseUpsertPage() {
  // If id exists => edit mode; else => create mode
  const routeParams = useParams<{ id?: string }>();
  const nav = useNavigate();
  const qc = useQueryClient();

  const [courseId, setCourseId] = useState<string | null>(routeParams.id ?? null);

  // fetch only if editing
  const { data: course, isLoading, isError } = useQuery({
    queryKey: ['myCourse', courseId],
    queryFn: () => getMyInstructorCourse(courseId!),
    enabled: !!courseId,
    staleTime: 10_000,
  });

  // ---------- unified form state ----------
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('en');
  const [level, setLevel] = useState<Level>('beginner');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string>('');
  const [thumbnail, setThumbnail] = useState<string>(''); // drag&drop, URL, or uploaded URL
  const [youtubeUrl, setYoutubeUrl] = useState('');       // single lesson
  const [durationSec, setDurationSec] = useState<number | ''>('');

  const [amountMajor, setAmountMajor] = useState<string>('0');
  const [currency, setCurrency] = useState<Currency>('GBP');

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // hydrate form when editing
  useEffect(() => {
    if (!course) return;
    setTitle(course.title || '');
    setSubtitle(course.subtitle || '');
    setDescription(course.description || '');
    setLanguage(course.language || 'en');
    setLevel((course.level as Level) || 'beginner');
    setCategory(course.category || '');
    setTags((course.tags || []).join(', '));
    setThumbnail(course.thumbnail || '');
    if (course.pricing) {
      const maj = ((course.pricing.amountMinor || 0) / 100).toFixed(2);
      setAmountMajor(course.pricing.isFree ? '0' : maj);
      setCurrency((course.pricing.currency as Currency) || 'GBP');
    } else {
      setAmountMajor('0'); setCurrency('GBP');
    }
  }, [course]);

  // ---------- actions ----------
  const mPublish   = useMutation({ mutationFn: () => publishCourse(courseId!),  onSuccess: () => qc.invalidateQueries({ queryKey: ['myCourse', courseId] }) });
  const mUnpublish = useMutation({ mutationFn: () => unpublishCourse(courseId!),onSuccess: () => qc.invalidateQueries({ queryKey: ['myCourse', courseId] }) });
  const mArchive   = useMutation({ mutationFn: () => archiveCourse(courseId!),  onSuccess: () => qc.invalidateQueries({ queryKey: ['myCourse', courseId] }) });
  const mRestore   = useMutation({ mutationFn: () => restoreCourse(courseId!),  onSuccess: () => qc.invalidateQueries({ queryKey: ['myCourse', courseId] }) });
  const mDelete    = useMutation({ mutationFn: () => deleteCourse(courseId!),   onSuccess: () => nav('/instructor/new') });

  // Save all: if new, create first, then update rest. If editing, just update.
  async function onSave(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setErr(null); setMsg(null); setSaving(true);

    try {
      let id = courseId;

      // Create if needed (minimal payload for server validation)
      if (!id) {
        if (!title.trim()) { setSaving(false); setErr('Title is required'); return; }
        const created = await createDraftCourse({ title: title.trim() });
        id = created.id;
        setCourseId(id);
        // replace URL so user stays on this same page
        nav(`/instructor/courses/${id}`, { replace: true });
      }

      // Basics
      await updateCourseBasics(id!, {
        title: title.trim(),
        subtitle,
        description,
        language,
        level,
        category: category.trim(),
        tags: tags.split(',').map(s => s.trim()).filter(Boolean),
        thumbnail,
        promoVideoUrl: '',
      });

      // Single YouTube lesson (optional but recommended)
      if (youtubeUrl.trim()) {
        await upsertSingleLesson(id!, {
          title: title.trim() || 'Lesson 1',
          youtubeUrl: youtubeUrl.trim(),
          durationSec: typeof durationSec === 'number' ? durationSec : 0,
        });
      }

      // Pricing
      const n = Number(amountMajor);
      await updateCoursePricing(id!, {
        amountMajor: Number.isFinite(n) && n >= 0 ? n : 0,
        currency,
      });

      await qc.invalidateQueries({ queryKey: ['myCourse', id] });
      setMsg('Saved');
    } catch (e: any) {
      setErr(e?.response?.data?.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  }

  // ---------- Thumbnail: drag & drop, upload, URL ----------
  const fileRef = useRef<HTMLInputElement | null>(null);

  const prevent = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); };

  const readAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Failed to read image'));
      reader.readAsDataURL(file);
    });

  async function uploadImageToServer(file: File): Promise<string> {
    // POST to your backend /uploads endpoint; expects JSON with { url }
    const fd = new FormData();
    fd.append('file', file);
    // If your backend expects a field name like 'image', change to fd.append('image', file)
    const res = await fetch('/uploads', {
      method: 'POST',
      body: fd,
      credentials: 'include',
    });
    if (!res.ok) {
      throw new Error(`Upload failed (${res.status})`);
    }
    const data: any = await res.json().catch(() => ({}));
    const url: string | undefined =
      data?.url || data?.fileUrl || data?.location || data?.href || data?.path;

    if (!url) throw new Error('Upload response missing url');
    // normalise to absolute if needed
    return url.startsWith('http') ? url : `${window.location.origin}${url}`;
  }

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) { setErr('Please select an image'); return; }
    setErr(null);
    setUploading(true);
    try {
      // Preferred: upload to server and store returned URL
      const url = await uploadImageToServer(file);
      setThumbnail(url);
    } catch (e) {
      // Fallback to base64 preview if upload route not available
      try {
        const dataUrl = await readAsDataUrl(file);
        setThumbnail(dataUrl);
      } catch {
        setErr('Failed to read image');
      }
    } finally {
      setUploading(false);
    }
  }

  function onDrop(e: React.DragEvent) {
    prevent(e);
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  }

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    void handleFile(file);
    e.target.value = ''; // allow re-pick same file
  }

  function clearThumbnail() {
    setThumbnail('');
  }

  const isPublished = (courseId && course?.status === 'published') || false;
  const isArchived  = (courseId && course?.status === 'archived')  || false;

  return (
    <form onSubmit={onSave} className="mx-auto max-w-5xl px-3 sm:px-4 py-4 sm:py-6 space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold">
            {courseId ? (course?.title || 'Edit course') : 'Create a course'}
          </h1>
          {courseId && <div className="text-xs sm:text-sm text-gray-500 break-all">{course?.slug}</div>}
          {courseId && (
            <div className="text-xs sm:text-sm text-gray-500">
              Status: <span className="font-medium">{course?.status}</span> · Price: <PricePretty {...course?.pricing} />
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/instructor/courses" className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50">Back</Link>
        </div>
      </header>

      {/* Responsive grid: 1 col on mobile, 2 cols on md+ */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[1.25fr,0.95fr]">
        {/* Fields */}
        <div className="order-2 md:order-1 space-y-4 rounded-md border bg-white p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">Name
              <input className="mt-1 w-full h-10 rounded-md border px-3"
                     value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Course title" />
            </label>
            <label className="text-sm">Level
              <select className="mt-1 w-full h-10 rounded-md border px-3"
                      value={level} onChange={(e)=>setLevel(e.target.value as Level)}>
                <option value="beginner">beginner</option>
                <option value="intermediate">intermediate</option>
                <option value="advanced">advanced</option>
              </select>
            </label>
          </div>

          <label className="text-sm block">Description
            <textarea className="mt-1 w-full min-h-28 rounded-md border px-3 py-2"
                      value={description} onChange={(e)=>setDescription(e.target.value)}
                      placeholder="What will students learn?" />
          </label>

          <div className="grid gap-3 sm:grid-cols-3">
            <label className="text-sm">Language
              <input className="mt-1 w-full h-10 rounded-md border px-3"
                     value={language} onChange={(e)=>setLanguage(e.target.value)} placeholder="en" />
            </label>
            <label className="text-sm">Category
              <input className="mt-1 w-full h-10 rounded-md border px-3"
                     value={category} onChange={(e)=>setCategory(e.target.value)} placeholder="ucat" />
            </label>
            {/* <label className="text-sm">Tags (comma)
              <input className="mt-1 w-full h-10 rounded-md border px-3"
                     value={tags} onChange={(e)=>setTags(e.target.value)} placeholder="ucat, practice" />
            </label> */}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">YouTube URL
              <input className="mt-1 w-full h-10 rounded-md border px-3"
                     value={youtubeUrl} onChange={(e)=>setYoutubeUrl(e.target.value)}
                     placeholder="https://www.youtube.com/watch?v=..." />
            </label>
            {/* <label className="text-sm">Duration (sec)
              <input className="mt-1 w-full h-10 rounded-md border px-3" type="number" min={0}
                     value={String(durationSec)} onChange={(e)=>setDurationSec(e.target.value ? Math.max(0, Number(e.target.value)) : '')}
                     placeholder="0" />
            </label> */}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">Price (major)
              <input className="mt-1 w-full h-10 rounded-md border px-3"
                     value={amountMajor} onChange={(e)=>setAmountMajor(e.target.value)}
                     placeholder="0.00 for Free" />
            </label>
            <label className="text-sm">Currency
              <select className="mt-1 w-full h-10 rounded-md border px-3"
                      value={currency} onChange={(e)=>setCurrency(e.target.value as Currency)}>
                <option value="GBP">GBP</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </label>
          </div>
        </div>

        {/* Thumbnail (responsive, with upload) */}
        <div className="order-1 md:order-2 space-y-3">
          <div className="rounded-md border border-dashed bg-white p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
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

            <div className="mt-3 flex flex-col sm:flex-row sm:items-start gap-3">
              {/* Small responsive preview box with drag & drop */}
              <div
                onDragEnter={prevent}
                onDragOver={prevent}
                onDragLeave={prevent}
                onDrop={onDrop}
                className="relative w-full sm:w-48 h-24 sm:h-28 md:h-36 rounded-md overflow-hidden bg-gray-50 border"
                title="Drop an image here"
              >
                {thumbnail ? (
                  <img
                    src={thumbnail}
                    alt="thumbnail"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 grid place-items-center text-[11px] text-gray-500 px-2 text-center">
                    Drag & drop image
                  </div>
                )}
              </div>

              {/* URL + actions */}
              <div className="flex-1 min-w-[240px]">
                <input
                  className="w-full h-10 rounded-md border px-3"
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  placeholder="or paste an image URL…"
                />

                <div className="mt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  {/* Hidden file input */}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onPickFile}
                  />
                  <Button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="w-full sm:w-auto"
                  >
                    {uploading ? 'Uploading…' : (thumbnail ? 'Replace…' : 'Upload image')}
                  </Button>
                  <span className="text-[11px] text-gray-500 sm:ml-1">
                    Recommended ~320×180 (16:9).
                  </span>
                </div>

                <p className="mt-1 text-[11px] text-gray-500">
                  Upload uses <code>/uploads</code>. If unavailable, we’ll fallback to a local preview.
                </p>
              </div>
            </div>
          </div>

          {courseId && (
            <div className="rounded-md border bg-white p-3 text-sm">
              <div>Current price: <b><PricePretty {...course?.pricing} /></b></div>
              <div>
                Status: <b>{course?.status}</b>
                {course?.publishedAt ? ` · Published at ${new Date(course.publishedAt).toLocaleString()}` : ''}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>

        {courseId && course?.status !== 'published' && (
          <Button variant="secondary" onClick={() => mPublish.mutate()} disabled={mPublish.isPending}>
            {mPublish.isPending ? 'Publishing…' : 'Publish'}
          </Button>
        )}
        {courseId && course?.status === 'published' && (
          <Button variant="ghost" onClick={() => mUnpublish.mutate()} disabled={mUnpublish.isPending}>
            {mUnpublish.isPending ? 'Unpublishing…' : 'Unpublish'}
          </Button>
        )}

        {courseId && course?.status !== 'archived' && (
          <Button variant="ghost" onClick={() => mArchive.mutate()} disabled={mArchive.isPending}>
            {mArchive.isPending ? 'Archiving…' : 'Archive'}
          </Button>
        )}
        {courseId && course?.status === 'archived' && (
          <Button variant="ghost" onClick={() => mRestore.mutate()} disabled={mRestore.isPending}>
            {mRestore.isPending ? 'Restoring…' : 'Restore'}
          </Button>
        )}

        {courseId && (
          <Button variant="ghost"
            onClick={() => { if (confirm('Delete draft? This cannot be undone.')) mDelete.mutate(); }}
            disabled={mDelete.isPending}>
            {mDelete.isPending ? 'Deleting…' : 'Delete'}
          </Button>
        )}

        {msg && <span className="text-sm text-green-700">{msg}</span>}
        {err && <span className="text-sm text-red-600">{err}</span>}
      </div>

      {/* Loading / error messages for edit mode */}
      {courseId && isLoading && <div className="p-2 text-sm">Loading…</div>}
      {courseId && (isError) && <div className="p-2 text-sm text-red-600">Failed to load course.</div>}
    </form>
  );
}
