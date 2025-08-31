import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthProvider';
import {
  listMyInstructorCourses,
  type MyCoursesResponse,
  type MyCourseListItem,
} from '@/lib/instructorCourses.api';

function useQueryParams() {
  const [sp, setSp] = useSearchParams();
  const status = (sp.get('status') as 'draft' | 'published' | 'archived' | null) ?? null;
  const q = sp.get('q') ?? '';
  const page = Math.max(1, parseInt(sp.get('page') || '1', 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(sp.get('limit') || '12', 10) || 12));

  const set = (next: Record<string, string | number | undefined | null>) => {
    const clone = new URLSearchParams(sp);
    Object.entries(next).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '') clone.delete(k);
      else clone.set(k, String(v));
    });
    // reset to page 1 when filters/search change
    if ('status' in next || 'q' in next) clone.set('page', '1');
    setSp(clone, { replace: true });
  };

  return { status, q, page, limit, set };
}

function formatPrice(p?: { amountMinor: number; currency: 'GBP'|'USD'|'EUR'; isFree: boolean }) {
  if (!p || p.isFree) return 'Free';
  const amount = (p.amountMinor ?? 0) / 100;
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: p.currency || 'GBP' }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${p.currency || ''}`;
  }
}

function StatusChip({ s }: { s: MyCourseListItem['status'] }) {
  const styles: Record<MyCourseListItem['status'], string> = {
    draft: 'bg-gray-100 text-gray-800',
    published: 'bg-green-100 text-green-800',
    archived: 'bg-amber-100 text-amber-800',
  };
  const label = s[0].toUpperCase() + s.slice(1);
  return <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${styles[s]}`}>{label}</span>;
}

export default function MyCoursesPage() {
  const { user, loading } = useAuth();
  const { status, q, page, limit, set } = useQueryParams();

  // debounced search input
  const [input, setInput] = useState(q);
  useEffect(() => setInput(q), [q]); // keep input in sync with URL
  useEffect(() => {
    const t = setTimeout(() => { if (input !== q) set({ q: input }); }, 300);
    return () => clearTimeout(t);
  }, [input]); // eslint-disable-line react-hooks/exhaustive-deps

  const queryKey = useMemo(() => ['myCourses', { status, q, page, limit }], [status, q, page, limit]);

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery<MyCoursesResponse>({
    queryKey,
    queryFn: () => listMyInstructorCourses({ status: status || undefined, q, page, limit }),
    enabled: !loading && !!user, // wait until auth known
    staleTime: 15_000,
    keepPreviousData: true,
  });

  const items = data?.items ?? [];

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-semibold">My Courses</h1>
        <Link to="/instructor/new" className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-white hover:opacity-95">
          + New course
        </Link>
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex rounded-md border border-gray-200 overflow-hidden">
          {(['all', 'draft', 'published', 'archived'] as const).map((tab) => {
            const active = (status ?? 'all') === tab;
            return (
              <button
                key={tab}
                onClick={() => set({ status: tab === 'all' ? null : tab })}
                className={`px-3 py-2 text-sm ${active ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} ${tab !== 'archived' ? 'border-r border-gray-200' : ''}`}
              >
                {tab[0].toUpperCase() + tab.slice(1)}
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-80">
          <input
            className="w-full h-10 rounded-md border border-gray-300 px-3 pr-8"
            placeholder="Search by title…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          {isFetching && (
            <div className="absolute right-2 top-2 h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
          )}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid gap-3 sm:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 w-full animate-pulse rounded-md bg-gray-100" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
          Failed to load courses. {(error as any)?.message || ''}
          <div><button className="mt-2 underline" onClick={() => refetch()}>Retry</button></div>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-md border border-gray-200 p-8 text-center">
          <div className="text-lg font-medium">No courses yet</div>
          <div className="mt-1 text-sm text-gray-600">Create your first course to get started.</div>
          <Link to="/instructor/new" className="mt-4 inline-flex h-10 items-center rounded-md bg-primary px-4 text-white hover:opacity-95">
            + New course
          </Link>
        </div>
      ) : (
        <>
          {/* Table (md+) */}
          <div className="hidden md:block overflow-hidden rounded-md border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Course</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Updated</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {items.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {c.thumbnail ? (
                          <img src={c.thumbnail} alt="" className="h-10 w-16 rounded object-cover" />
                        ) : (
                          <div className="h-10 w-16 rounded bg-gray-100" />
                        )}
                        <div>
                          <div className="font-medium">{c.title}</div>
                          <div className="text-xs text-gray-500">{c.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><StatusChip s={c.status} /></td>
                    <td className="px-4 py-3">{formatPrice(c.pricing)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(c.updatedAt).toLocaleDateString()} {new Date(c.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/instructor/courses/${c.id}`} className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50">Edit</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cards (mobile) */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {items.map((c) => (
              <Link key={c.id} to={`/instructor/courses/${c.id}`} className="flex items-center gap-3 rounded-md border border-gray-200 bg-white p-3">
                {c.thumbnail ? (
                  <img src={c.thumbnail} alt="" className="h-14 w-20 rounded object-cover" />
                ) : (
                  <div className="h-14 w-20 rounded bg-gray-100" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{c.title}</div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-600">
                    <StatusChip s={c.status} />
                    <span>•</span>
                    <span>{formatPrice(c.pricing)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            page={data?.meta.page ?? 1}
            hasNext={Boolean(data?.meta.hasNextPage)}
            onPrev={() => set({ page: Math.max(1, page - 1) })}
            onNext={() => set({ page: (page + 1) })}
          />
        </>
      )}
    </div>
  );
}

function Pagination({ page, hasNext, onPrev, onNext }: { page: number; hasNext: boolean; onPrev: () => void; onNext: () => void }) {
  return (
    <div className="mt-4 flex items-center justify-center gap-2">
      <button
        onClick={onPrev}
        disabled={page <= 1}
        className="rounded-md border px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
      >
        ← Prev
      </button>
      <div className="text-sm text-gray-600">Page {page}</div>
      <button
        onClick={onNext}
        disabled={!hasNext}
        className="rounded-md border px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
      >
        Next →
      </button>
    </div>
  );
}
