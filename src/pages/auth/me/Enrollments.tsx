import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { listMyEnrollments, type EnrollmentCard } from '@/lib/enrollments.api';

function ViaBadge({ via }: { via: EnrollmentCard['via'] }) {
  const tone =
    via === 'membership' ? 'bg-green-100 text-green-800 border-green-200' :
    via === 'purchase'   ? 'bg-indigo-100 text-indigo-800 border-indigo-200' :
                           'bg-gray-100 text-gray-700 border-gray-200';
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] ${tone}`}>{via}</span>;
}

function StatusBadge({ status }: { status: EnrollmentCard['status'] }) {
  const tone =
    status === 'active' ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        : 'bg-amber-100 text-amber-800 border-amber-200';
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] ${tone}`}>{status}</span>;
}

const fmtDate = (s?: string | null) => (s ? new Date(s).toLocaleDateString() : '');

function Price({ p }: { p?: { amountMinor?: number; currency?: 'GBP'|'USD'|'EUR'; isFree?: boolean } }) {
  if (!p || p.isFree || !p.amountMinor) return <span className="text-gray-500">Free</span>;
  const n = (p.amountMinor || 0) / 100;
  try {
    return <span>{new Intl.NumberFormat(undefined, { style: 'currency', currency: p.currency || 'GBP' }).format(n)}</span>;
  } catch {
    return <span>£{n.toFixed(2)}</span>;
  }
}

export default function Enrollments() {
  const [page, setPage] = useState(1);
  const limit = 12;

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ['me', 'enrollments', page, limit],
    queryFn: () => listMyEnrollments(page, limit),
    placeholderData: (prev) => prev, // keep previous page while fetching next
  });

  const items = data?.items ?? [];
  const hasNext = !!data?.meta?.hasNextPage;

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 space-y-4">
      <div className="flex items-end justify-between gap-3">
        <h2 className="text-2xl font-semibold">My courses</h2>
        {isFetching && <span className="text-xs text-gray-500">Refreshing…</span>}
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border p-4 animate-pulse">
              <div className="aspect-video rounded-lg bg-gray-200" />
              <div className="mt-3 h-4 w-2/3 rounded bg-gray-200" />
              <div className="mt-2 h-3 w-1/3 rounded bg-gray-200" />
              <div className="mt-4 h-9 w-32 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {isError && !isLoading && (
        <div className="rounded border p-4 text-red-600">Failed to load your enrollments.</div>
      )}

      {/* Empty */}
      {!isLoading && !isError && items.length === 0 && (
        <div className="rounded-2xl border p-8 text-center">
          <div className="text-lg font-medium">No courses yet</div>
          <p className="mt-1 text-sm text-gray-600">Browse courses or get Lifetime to unlock everything.</p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <Link to="/courses" className="inline-flex h-10 items-center rounded-md border px-4 text-sm hover:bg-gray-50">Browse courses</Link>
            <Link to="/billing/plans" className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-white hover:opacity-95">Get Lifetime</Link>
          </div>
        </div>
      )}

      {/* Grid */}
      {!isLoading && !isError && items.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((enr) => {
              const c = enr.course;
              return (
                <div key={(enr.enrollmentId || enr.id || `${enr.userId}-${enr.courseId}`) as string}
                     className={`rounded-2xl border p-4 ${enr.status !== 'active' ? 'opacity-70' : ''}`}>
                  <Link to={`/learn/${encodeURIComponent(c.slug)}`} className="block">
                    <div className="aspect-video w-full overflow-hidden rounded-lg bg-gray-50">
                      {c.thumbnail ? (
                        <img src={c.thumbnail} alt={c.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-gray-400">No thumbnail</div>
                      )}
                    </div>
                  </Link>

                  <div className="mt-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link to={`/learn/${encodeURIComponent(c.slug)}`} className="font-medium line-clamp-2 hover:underline">
                        {c.title}
                      </Link>
                      <div className="mt-1 text-xs text-gray-500">
                        Activated {fmtDate(enr.activatedAt)}
                        {enr.expiresAt ? <> • Expires {fmtDate(enr.expiresAt)}</> : null}
                      </div>
                    </div>
                    <div className="shrink-0 space-y-1 text-right">
                      <ViaBadge via={enr.via} />
                      <div className="mt-1"><StatusBadge status={enr.status} /></div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      {c.level && <span className="rounded-full border px-2 py-0.5 text-[11px]">{c.level}</span>}
                      {c.language && <span className="rounded-full border px-2 py-0.5 text-[11px]">{c.language}</span>}
                      {typeof c.totalDurationSec === 'number' && c.totalDurationSec > 0 && (
                        <span className="rounded-full border px-2 py-0.5 text-[11px]">
                          {Math.floor((c.totalDurationSec || 0)/60)}m
                        </span>
                      )}
                    </div>
                    <div className="font-medium">
                      <Price p={c.pricing} />
                    </div>
                  </div>

                  <div className="mt-4">
                    <Link
                      to={`/learn/${encodeURIComponent(c.slug)}`}
                      className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-white hover:opacity-95"
                    >
                      Continue learning
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pager */}
          <div className="flex items-center justify-center gap-2 pt-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="inline-flex h-10 items-center rounded-md border px-4 text-sm disabled:opacity-50 hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">Page {page}</span>
            <button
              onClick={() => hasNext && setPage((p) => p + 1)}
              disabled={!hasNext}
              className="inline-flex h-10 items-center rounded-md border px-4 text-sm disabled:opacity-50 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
