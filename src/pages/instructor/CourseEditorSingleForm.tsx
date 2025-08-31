// src/pages/instructor/CourseEditorSingleForm.tsx
import { useEffect, useRef, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getMyInstructorCourse,
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
  } catch {
    return <>{amount.toFixed(2)} {p.currency || ''}</>;
  }
}

export default function CourseEditorSingleForm() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const qc = useQueryClient();

  const { data: course, isLoading, isError } = useQuery({
    queryKey: ['myCourse', id],
    queryFn: () => getMyInstructorCourse(id!),
    enabled: !!id,
    staleTime: 10_000,
  });

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('en');
  const [level, setLevel] = useState<Level>('beginner');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string>('');
  const [thumbnail, setThumbnail] = useState<string>('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [durationSec, setDurationSec] = useState<number | ''>('');

  const [amountMajor, setAmountMajor] = useState<string>('0');
  const [currency, setCurrency] = useState<Currency>('GBP');

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

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

  const mPublish = useMutation({
    mutationFn: () => publishCourse(id!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['myCourse', id] }),
  });
  const mUnpublish = useMutation({
    mutationFn: () => unpublishCourse(id!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['myCourse', id] }),
  });
  const mArchive = useMutation({
    mutationFn: () => archiveCourse(id!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['myCourse', id] }),
  });
  const mRestore = useMutation({
    mutationFn: () => restoreCourse(id!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['myCourse', id] }),
  });
  const mDelete = useMutation({
    mutationFn: () => deleteCourse(id!),
    onSuccess: () => nav('/instructor/new'),
  });

  async function saveAll(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setErr(null); setMsg(null); setSaving(true);
    try {
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
      if (youtubeUrl.trim()) {
        await upsertSingleLesson(id!, {
          title: title.trim() || 'Lesson 1',
          youtubeUrl: youtubeUrl.trim(),
          durationSec: typeof durationSec === 'number' ? durationSec : 0,
        });
      }
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

  const dropRef = useRef<HTMLDivElement | null>(null);
  const preventDefaults = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); };
  const onDrop = (e: React.DragEvent) => {
    preventDefaults(e);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setErr('Please drop an image'); return; }
    const reader = new FileReader();
    reader.onload = () => setThumbnail(String(reader.result || ''));
    reader.onerror = () => setErr('Failed to read image');
    reader.readAsDataURL(file);
  };

  if (isLoading) return <div className="p-6">Loading…</div>;
  if (isError || !course) return <div className="p-6 text-red-600">Failed to load course.</div>;

  const isPublished = course.status === 'published';
  const isArchived  = course.status === 'archived';

  return (
    <form onSubmit={saveAll} className="mx-auto max-w-5xl p-4 sm:p-6 space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{course.title || 'Edit course'}</h1>
          <div className="text-sm text-gray-500">{course.slug}</div>
          <div className="text-sm text-gray-500">
            Status: <span className="font-medium">{course.status}</span> · Price: <PricePretty {...course.pricing} />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/instructor/courses" className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50">Back</Link>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-[1.25fr,0.9fr]">
        <div className="space-y-4 rounded-md border bg-white p-4">
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
            <label className="text-sm">Tags (comma)
              <input className="mt-1 w-full h-10 rounded-md border px-3"
                value={tags} onChange={(e)=>setTags(e.target.value)} placeholder="ucat, practice" />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">YouTube URL (single lesson)
              <input className="mt-1 w-full h-10 rounded-md border px-3"
                value={youtubeUrl} onChange={(e)=>setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..." />
            </label>
            <label className="text-sm">Duration (sec)
              <input className="mt-1 w-full h-10 rounded-md border px-3" type="number" min={0}
                value={String(durationSec)} onChange={(e)=>setDurationSec(e.target.value ? Math.max(0, Number(e.target.value)) : '')}
                placeholder="0" />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">Price (major)
              <input className="mt-1 w-full h-10 rounded-md border px-3"
                value={amountMajor} onChange={(e)=>setAmountMajor(e.target.value)} placeholder="0.00 for Free" />
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

        <div className="space-y-3">
          <div
            ref={dropRef}
            onDragEnter={preventDefaults}
            onDragOver={preventDefaults}
            onDragLeave={preventDefaults}
            onDrop={onDrop}
            className="rounded-md border border-dashed p-4 bg-white"
          >
            <div className="text-sm font-medium">Thumbnail</div>
            <div className="mt-2 grid gap-2">
              <div className="aspect-video rounded-md overflow-hidden bg-gray-50 border">
                {thumbnail
                  ? <img src={thumbnail} alt="thumbnail" className="w-full h-full object-cover" />
                  : <div className="h-full w-full grid place-items-center text-xs text-gray-500">Drop an image here</div>}
              </div>
              <input className="w-full h-10 rounded-md border px-3"
                value={thumbnail} onChange={(e)=>setThumbnail(e.target.value)}
                placeholder="or paste an image URL…" />
              <p className="text-xs text-gray-500">Drag & drop, or paste an image URL.</p>
            </div>
          </div>

          <div className="rounded-md border bg-white p-3 text-sm">
            <div>Current price: <b><PricePretty {...course.pricing} /></b></div>
            <div>Status: <b>{course.status}</b>{course.publishedAt ? ` · Published at ${new Date(course.publishedAt).toLocaleString()}` : ''}</div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save all changes'}</Button>

        {course.status !== 'published' && (
          <Button variant="secondary" onClick={() => mPublish.mutate()} disabled={mPublish.isPending}>
            {mPublish.isPending ? 'Publishing…' : 'Publish'}
          </Button>
        )}
        {course.status === 'published' && (
          <Button variant="ghost" onClick={() => mUnpublish.mutate()} disabled={mUnpublish.isPending}>
            {mUnpublish.isPending ? 'Unpublishing…' : 'Unpublish'}
          </Button>
        )}

        {course.status !== 'archived' && (
          <Button variant="ghost" onClick={() => mArchive.mutate()} disabled={mArchive.isPending}>
            {mArchive.isPending ? 'Archiving…' : 'Archive'}
          </Button>
        )}
        {course.status === 'archived' && (
          <Button variant="ghost" onClick={() => mRestore.mutate()} disabled={mRestore.isPending}>
            {mRestore.isPending ? 'Restoring…' : 'Restore'}
          </Button>
        )}

        <Button variant="ghost"
          onClick={() => { if (confirm('Delete draft? This cannot be undone.')) mDelete.mutate(); }}
          disabled={mDelete.isPending}>
          {mDelete.isPending ? 'Deleting…' : 'Delete'}
        </Button>

        {msg && <span className="text-sm text-green-700">{msg}</span>}
        {err && <span className="text-sm text-red-600">{err}</span>}
      </div>
    </form>
  );
}
