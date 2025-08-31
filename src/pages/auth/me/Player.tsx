import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getPlayerBundle, type PlayerLesson } from '@/lib/learn.api';
import VideoPlayer from '@/components/player/VideoPlayer';

export default function Player() {
  const { slug = '' } = useParams<{ slug: string }>();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['player', slug],
    queryFn: () => getPlayerBundle(slug),
    enabled: !!slug,
    staleTime: 5_000,
  });

  const sections = data?.sections || [];
  const firstLesson = useMemo(() => {
    for (const s of sections) if (s.lessons?.length) return s.lessons[0];
    return null;
  }, [sections]);

  const [currentId, setCurrentId] = useState<string | null>(null);
  const current: PlayerLesson | null = useMemo(() => {
    if (!sections.length) return null;
    const id = currentId || firstLesson?.id || null;
    if (!id) return null;
    for (const s of sections) {
      const l = s.lessons.find(x => String(x.id) === String(id));
      if (l) return l;
    }
    return null;
  }, [sections, currentId, firstLesson]);

  if (isLoading) return <div className="p-6">Loading…</div>;
  if (isError) return <div className="p-6 text-red-600">Failed to load. {(error as any)?.message || ''}</div>;
  if (!data) return null;
  if (!data.access?.ok) {
    return (
      <div className="mx-auto max-w-2xl rounded-lg border bg-white p-6">
        <h1 className="text-xl font-semibold mb-2">{data.course?.title}</h1>
        <p className="text-gray-700">You don’t have access to this course.</p>
        <Link className="mt-3 inline-block rounded-md bg-primary px-4 py-2 text-white" to={`/courses/${data.course.slug}`}>
          View course page
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[300px,1fr]">
      {/* Sidebar */}
      <aside className="card p-4 space-y-3">
        <div className="font-semibold">{data.course.title}</div>
        <nav className="space-y-2">
          {sections.map((s, si) => (
            <div key={s.id} className="rounded-md border">
              <div className="px-3 py-2 text-sm font-medium bg-gray-50">{si + 1}. {s.title}</div>
              <div className="p-2 space-y-1">
                {s.lessons.map((l, li) => {
                  const active = String(l.id) === String(current?.id);
                  return (
                    <button
                      key={l.id}
                      className={`w-full rounded px-2 py-1 text-left text-sm ${active ? 'bg-gray-900 text-white' : 'hover:bg-gray-100'}`}
                      onClick={() => setCurrentId(l.id)}
                    >
                      {si + 1}.{li + 1} {l.title}
                      <span className="ml-2 text-[11px] uppercase tracking-wide text-gray-500">{l.type}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="space-y-4">
        {!current ? (
          <div className="h-64 grid place-items-center text-gray-600">Select a lesson…</div>
        ) : current.type === 'video' ? (
          <>
            <VideoPlayer video={current.video || undefined} />
            {/* For YouTube, we can’t auto-detect end without the IFrame API; offer manual “Mark complete” if you track progress */}
            {/* <button className="rounded border px-3 py-1 text-sm">Mark lesson complete</button> */}
          </>
        ) : current.type === 'text' ? (
          <div className="rounded-lg border bg-white p-4 prose max-w-none whitespace-pre-wrap">
            {(current as any).textContent || ''}
          </div>
        ) : (
          <div className="rounded-lg border bg-white p-4">
            <div className="mb-2 text-lg font-medium">{current.title}</div>
            <Link to={`/learn/quizzes/${(current as any).quizId}`} className="rounded-md bg-primary px-4 py-2 text-white">
              Start quiz
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
