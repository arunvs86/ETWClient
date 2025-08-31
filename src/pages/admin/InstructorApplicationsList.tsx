import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useInstructorApplications } from '../../api/instructorApps';

type Status = 'pending' | 'approved' | 'rejected';
const PAGE_SIZES = [10, 20, 50] as const;

const STATUSES: Array<{ label: string; value?: Status }> = [
  { label: 'All' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
];

function StatusBadge({ status }: { status: Status }) {
  const cls =
    status === 'approved'
      ? 'bg-green-100 text-green-800 ring-green-200'
      : status === 'rejected'
      ? 'bg-red-100 text-red-800 ring-red-200'
      : 'bg-amber-100 text-amber-800 ring-amber-200';
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${cls}`}>
      {status[0].toUpperCase() + status.slice(1)}
    </span>
  );
}

function parseNumberParam(v: string | null, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export default function InstructorApplicationsList() {
  const [params, setParams] = useSearchParams();

  // read params safely
  const initialSearch = params.get('q') ?? '';
  const initialStatus = (params.get('status') as Status | null) ?? undefined;
  const initialPage = parseNumberParam(params.get('page'), 1);
  const initialLimitRaw = parseNumberParam(params.get('limit'), PAGE_SIZES[0]);
  const initialLimit = PAGE_SIZES.includes(initialLimitRaw as any) ? initialLimitRaw : PAGE_SIZES[0];
  const mock = params.get('mock') === '1';

  // local UI state for search (debounced)
  const [search, setSearch] = useState(initialSearch);
  const [debouncedQ, setDebouncedQ] = useState(initialSearch);
  const status = initialStatus;
  const page = initialPage;
  const limit = initialLimit;

  // debounce search typing
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // when debounced search changes, sync to URL (and reset page)
  useEffect(() => {
    const next = new URLSearchParams(params);
    if (debouncedQ) next.set('q', debouncedQ);
    else next.delete('q');
    next.set('page', '1');
    setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ]);

  function updateParam(updates: Record<string, string | null>) {
    const next = new URLSearchParams(params);
    Object.entries(updates).forEach(([k, v]) => {
      if (v === null) next.delete(k);
      else next.set(k, v);
    });
    setParams(next, { replace: true });
  }

  function resetFilters() {
    const next = new URLSearchParams(params);
    next.delete('status');
    next.delete('q');
    next.set('page', '1');
    setSearch(''); // clear input immediately
    setParams(next, { replace: true });
  }

  // fetch data
  const queryParams = useMemo(
    () => ({ status, q: debouncedQ || undefined, page, limit, mock }),
    [status, debouncedQ, page, limit, mock]
  );
  const { data, isLoading, isError, error } = useInstructorApplications(queryParams);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil((total || 0) / (limit || 10)));
  const hasData = items.length > 0;

  // If current page exceeds total pages (e.g., after narrowing filters), clamp to last page
  useEffect(() => {
    if (!isLoading && !isError && total > 0 && page > totalPages) {
      updateParam({ page: String(totalPages) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total, totalPages, isLoading, isError]);

  // results summary numbers
  const startIdx = total === 0 ? 0 : (page - 1) * limit + 1;
  const endIdx = Math.min(page * limit, total);

  return (
    <div className="p-4 md:p-6">
      {/* Header + filter chips */}
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-xl font-semibold">Instructor Applications</h1>
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Status filter">
          {STATUSES.map((s) => {
            const active = (s.value ?? undefined) === status || (!s.value && !status);
            return (
              <button
                key={s.label}
                aria-pressed={active}
                onClick={() => updateParam({ status: s.value ?? null, page: '1' })}
                className={`rounded px-3 py-1 text-sm border ${
                  active ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-300 hover:bg-gray-100'
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search with clear button */}
        <div className="relative w-full sm:w-80">
          <input
            className="w-full rounded border border-gray-300 pl-3 pr-9 py-2 text-sm"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setDebouncedQ(search); // trigger immediately on Enter
              }
            }}
            aria-label="Search applications"
          />
          {search && (
            <button
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded hover:bg-gray-100"
              onClick={() => setSearch('')}
            >
              ×
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 sm:ml-auto">
          <select
            className="rounded border border-gray-300 px-2 py-2 text-sm"
            value={String(limit)}
            onChange={(e) => updateParam({ limit: e.target.value, page: '1' })}
            aria-label="Items per page"
          >
            {PAGE_SIZES.map((n) => (
              <option key={n} value={n}>
                {n}/page
              </option>
            ))}
          </select>

          <button
            className="rounded border border-gray-300 px-3 py-2 text-sm"
            onClick={resetFilters}
            title="Reset status and search"
          >
            Reset
          </button>

          <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={mock}
              onChange={(e) => updateParam({ mock: e.target.checked ? '1' : null, page: '1' })}
            />
            Mock
          </label>
        </div>
      </div>

      {/* Results summary */}
      <div className="mb-2 text-xs text-gray-600">
        {isLoading ? 'Loading…' : `Showing ${startIdx}-${endIdx} of ${total}`}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-gray-700">Applicant</th>
              <th className="px-3 py-2 text-left font-medium text-gray-700">Email</th>
              <th className="px-3 py-2 text-left font-medium text-gray-700">Status</th>
              <th className="px-3 py-2 text-left font-medium text-gray-700">Submitted</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {/* Loading skeletons */}
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`sk-${i}`} className="animate-pulse">
                  <td className="px-3 py-3"><div className="h-4 w-40 bg-gray-200 rounded" /></td>
                  <td className="px-3 py-3"><div className="h-4 w-56 bg-gray-200 rounded" /></td>
                  <td className="px-3 py-3"><div className="h-5 w-16 bg-gray-200 rounded-full" /></td>
                  <td className="px-3 py-3"><div className="h-4 w-28 bg-gray-200 rounded" /></td>
                  <td className="px-3 py-3 text-right"><div className="h-8 w-20 bg-gray-200 rounded" /></td>
                </tr>
              ))}

            {/* Error state */}
            {!isLoading && isError && (
              <tr>
                <td colSpan={5} className="px-3 py-10 text-center text-red-600">
                  Failed to load applications{(error as any)?.message ? `: ${(error as any).message}` : ''}. Try toggling <b>Mock</b> or hitting refresh.
                </td>
              </tr>
            )}

            {/* Empty state */}
            {!isLoading && !isError && !hasData && (
              <tr>
                <td colSpan={5} className="px-3 py-10 text-center text-gray-500">
                  No applications found{(status || debouncedQ) ? ' for current filters.' : '.'}
                  {(status || debouncedQ) && (
                    <button className="ml-2 underline" onClick={resetFilters}>
                      Clear filters
                    </button>
                  )}
                </td>
              </tr>
            )}

            {/* Data rows */}
            {!isLoading && !isError && hasData &&
  items.map((row, i) => {
    const k =
      row._id
      ?? row.user?._id
      ?? row.user?.email
      ?? `${page}-${i}`; // last-resort fallback so keys stay unique per page

    return (
      <tr key={k}>
        <td className="px-3 py-3">{row.user?.name || '(no name)'}</td>
        <td className="px-3 py-3">{row.user?.email || '—'}</td>
        <td className="px-3 py-3"><StatusBadge status={row.status as any} /></td>
        <td className="px-3 py-3">
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—'}
        </td>
        <td className="px-3 py-3 text-right">
          <Link
            to={`/admin/instructors/applications/${row._id}`}
            className="inline-flex items-center rounded border border-gray-300 px-3 py-1 hover:bg-gray-50"
          >
            View
          </Link>
        </td>
      </tr>
    );
  })
}

          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between gap-2 pt-4">
        <button
          className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
          onClick={() => updateParam({ page: String(Math.max(1, page - 1)) })}
          disabled={page <= 1 || isLoading}
        >
          Previous
        </button>
        <div className="text-sm">Page {Math.min(page, totalPages)} of {totalPages}</div>
        <button
          className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
          onClick={() => updateParam({ page: String(Math.min(page + 1, totalPages)) })}
          disabled={page >= totalPages || isLoading}
        >
          Next
        </button>
      </div>

      {/* Dev-only: mock detail link remains until detail route exists */}
      <div className="pt-6 text-xs text-gray-500">
        <span className="mr-2">Dev test:</span>
        <Link className="underline" to="/admin/instructors/applications/mock-id-123">
          Open a mock detail page (will 404 until Step 5)
        </Link>
      </div>
    </div>
  );
}
