// // src/pages/tutors/TutorsListPage.tsx
// import { useEffect, useMemo, useState } from 'react';
// import { useSearchParams, Link } from 'react-router-dom';
// import TutorCard from '@/components/tutors/TutorCard';
// import { fetchTutors, type TutorsListParams, type TutorsListResponse } from '@/lib/tutors.api';
// import { api } from '@/lib/api';

// function toInt(v: string | null | undefined, fallback: number) {
//   const n = Number(v);
//   return Number.isFinite(n) && n > 0 ? n : fallback;
// }
// function toMinor(v: string | null | undefined) {
//   if (!v) return undefined;
//   const n = Number(v);
//   return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : undefined; // £ → minor
// }

// export default function TutorsListPage() {
//   const [sp, setSp] = useSearchParams();

//   // URL state
//   const q = sp.get('q') || '';
//   const subject = sp.get('subject') || '';
//   const language = sp.get('language') || '';
//   const sort = (sp.get('sort') as TutorsListParams['sort']) || 'rating';
//   const page = toInt(sp.get('page'), 1);
//   const limit = toInt(sp.get('limit'), 12);
//   const minPrice = toMinor(sp.get('minPrice'));
//   const maxPrice = toMinor(sp.get('maxPrice'));

//   const params: TutorsListParams = useMemo(
//     () => ({
//       q: q || undefined,
//       subject: subject || undefined,
//       language: language || undefined,
//       sort,
//       page,
//       limit,
//       minPrice,
//       maxPrice,
//     }),
//     [q, subject, language, sort, page, limit, minPrice, maxPrice]
//   );

//   // Local data state (plain fetch to match your API style)
//   const [data, setData] = useState<TutorsListResponse | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [err, setErr] = useState<string>('');

//   async function load() {
//     try {
//       setLoading(true);
//       setErr('');
//       const resp = await fetchTutors(params);
//       setData(resp);
//     } catch (e: any) {
//       const msg = e?.response?.data?.message || e?.message || 'Failed to load';
//       setErr(msg);
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     // optional: ensure auth cookie/AT exists before calling (if your backend requires for reads; if public, you can skip)
//     // await ensureAuth(); // uncomment if needed
//     load();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [api.defaults.baseURL, JSON.stringify(params)]);

//   function update(partial: Record<string, string | undefined>) {
//     const next = new URLSearchParams(sp);
//     Object.entries(partial).forEach(([k, v]) => {
//       if (v == null || v === '') next.delete(k);
//       else next.set(k, v);
//     });
//     // reset to first page when filters change
//     if (
//       partial.q !== undefined ||
//       partial.subject !== undefined ||
//       partial.language !== undefined ||
//       partial.minPrice !== undefined ||
//       partial.maxPrice !== undefined ||
//       partial.sort !== undefined
//     ) {
//       next.set('page', '1');
//     }
//     setSp(next, { replace: true });
//   }

//   const total = data?.total || 0;
//   const totalPages = Math.max(1, Math.ceil(total / limit));

//   return (
//     <div className="mx-auto max-w-6xl px-4 py-6">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
//         <div>
//           <h1 className="text-2xl font-bold">Tutors</h1>
//           <p className="text-gray-600 text-sm">Book 1-to-1 sessions with verified instructors.</p>
//         </div>
//         <div className="flex items-center gap-2">
//           <label className="text-sm text-gray-600">Sort</label>
//           <select
//             className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
//             value={sort}
//             onChange={(e) => update({ sort: e.target.value })}
//           >
//             <option value="rating">Top rated</option>
//             <option value="price_asc">Price: Low to High</option>
//             <option value="price_desc">Price: High to Low</option>
//             <option value="recent">Recently added</option>
//           </select>
//         </div>
//       </div>

//       {/* Filters */}
//       <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-3">
//         <input
//           className="md:col-span-4 rounded-xl border border-gray-200 px-3 py-2 text-sm"
//           placeholder="Search by name, headline, bio"
//           value={q}
//           onChange={(e) => update({ q: e.target.value })}
//         />
//         <input
//           className="md:col-span-3 rounded-xl border border-gray-200 px-3 py-2 text-sm"
//           placeholder="Subject (e.g., UCAT)"
//           value={subject}
//           onChange={(e) => update({ subject: e.target.value })}
//         />
//         <input
//           className="md:col-span-2 rounded-xl border border-gray-200 px-3 py-2 text-sm"
//           placeholder="Language (e.g., en)"
//           value={language}
//           onChange={(e) => update({ language: e.target.value })}
//         />
//         <div className="md:col-span-3 flex items-center gap-2">
//           <input
//             className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
//             placeholder="Min £/hr"
//             inputMode="numeric"
//             defaultValue={sp.get('minPrice') || ''}
//             onBlur={(e) => update({ minPrice: e.target.value || undefined })}
//           />
//           <span className="text-gray-400">–</span>
//           <input
//             className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
//             placeholder="Max £/hr"
//             inputMode="numeric"
//             defaultValue={sp.get('maxPrice') || ''}
//             onBlur={(e) => update({ maxPrice: e.target.value || undefined })}
//           />
//         </div>
//       </div>

//       {/* Content */}
//       <div className="mt-6 min-h-[200px]">
//         {loading && <div className="text-gray-600">Loading tutors…</div>}
//         {!!err && !loading && <div className="text-red-600 text-sm">Failed to load: {err}</div>}

//         {!loading && !err && (
//           <>
//             {data?.items?.length ? (
//               <>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//                   {data.items.map((t) => (
//                     <TutorCard key={t._id} tutor={t} />
//                   ))}
//                 </div>

//                 {/* Pagination */}
//                 <div className="mt-6 flex items-center justify-between">
//                   <div className="text-sm text-gray-600">
//                     Page <span className="font-medium">{data.page}</span> of{' '}
//                     <span className="font-medium">{totalPages}</span> •{' '}
//                     <span className="font-medium">{total}</span> tutors
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <button
//                       className="rounded-xl border px-3 py-2 text-sm disabled:opacity-50"
//                       disabled={page <= 1}
//                       onClick={() => update({ page: String(page - 1) })}
//                     >
//                       Prev
//                     </button>
//                     <button
//                       className="rounded-xl border px-3 py-2 text-sm disabled:opacity-50"
//                       disabled={page >= totalPages}
//                       onClick={() => update({ page: String(page + 1) })}
//                     >
//                       Next
//                     </button>
//                   </div>
//                 </div>
//               </>
//             ) : (
//               <div className="text-gray-600">No tutors found. Try adjusting filters.</div>
//             )}
//           </>
//         )}
//       </div>

//       {/* (Optional) Back to home */}
//       <div className="mt-8">
//         <Link to="/" className="text-sm text-blue-700 hover:underline">← Back to Home</Link>
//       </div>
//     </div>
//   );
// }


// src/pages/tutors/TutorsListPage.tsx
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import TutorCard from '@/components/tutors/TutorCard';
import { fetchTutors, type TutorsListParams, type TutorsListResponse } from '@/lib/tutors.api';
import { api } from '@/lib/api';
import {
  Search,
  BookUser,
  Languages,
  PoundSterling,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';

function toInt(v: string | null | undefined, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}
function toMinor(v: string | null | undefined) {
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : undefined; // £ → minor
}

export default function TutorsListPage() {
  const [sp, setSp] = useSearchParams();

  // URL state
  const q = sp.get('q') || '';
  const subject = sp.get('subject') || '';
  const language = sp.get('language') || '';
  const sort = (sp.get('sort') as TutorsListParams['sort']) || 'rating';
  const page = toInt(sp.get('page'), 1);
  const limit = toInt(sp.get('limit'), 12);
  const minPrice = toMinor(sp.get('minPrice'));
  const maxPrice = toMinor(sp.get('maxPrice'));

  const params: TutorsListParams = useMemo(
    () => ({
      q: q || undefined,
      subject: subject || undefined,
      language: language || undefined,
      sort,
      page,
      limit,
      minPrice,
      maxPrice,
    }),
    [q, subject, language, sort, page, limit, minPrice, maxPrice]
  );

  // Local data state (plain fetch to match your API style)
  const [data, setData] = useState<TutorsListResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<string>('');

  async function load() {
    try {
      setLoading(true);
      setErr('');
      const resp = await fetchTutors(params);
      setData(resp);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to load';
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api.defaults.baseURL, JSON.stringify(params)]);

  function update(partial: Record<string, string | undefined>) {
    const next = new URLSearchParams(sp);
    Object.entries(partial).forEach(([k, v]) => {
      if (v == null || v === '') next.delete(k);
      else next.set(k, v);
    });
    // reset to first page when filters change
    if (
      partial.q !== undefined ||
      partial.subject !== undefined ||
      partial.language !== undefined ||
      partial.minPrice !== undefined ||
      partial.maxPrice !== undefined ||
      partial.sort !== undefined
    ) {
      next.set('page', '1');
    }
    setSp(next, { replace: true });
  }

  const total = data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
      {/* Header */}
      <div className="rounded-2xl border bg-gradient-to-br from-white to-gray-50 p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10">
                <BookUser className="h-4 w-4 text-primary" />
              </span>
              Tutors
            </h1>
            <p className="mt-1 text-sm text-gray-600">Book 1-to-1 sessions with verified instructors.</p>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Sort</label>
            <select
              className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none transition focus:ring-4 focus:ring-primary/20"
              value={sort}
              onChange={(e) => update({ sort: e.target.value })}
            >
              <option value="rating">Top rated</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="recent">Recently added</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-[56px] z-[5] -mx-4 px-4 py-3 rounded-none md:rounded-xl bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border md:border">
        <div className="mb-2 flex items-center gap-2 text-xs text-gray-500">
          <SlidersHorizontal className="h-4 w-4" />
          Refine your search
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
          {/* Search */}
          <div className="relative md:col-span-4">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20"
              placeholder="Search by name, headline, bio"
              value={q}
              onChange={(e) => update({ q: e.target.value })}
            />
          </div>

          {/* Subject */}
          <div className="relative md:col-span-3">
            <BookUser className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20"
              placeholder="Subject (e.g., UCAT)"
              value={subject}
              onChange={(e) => update({ subject: e.target.value })}
            />
          </div>

          {/* Language */}
          <div className="relative md:col-span-2">
            <Languages className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20"
              placeholder="Language (e.g., en)"
              value={language}
              onChange={(e) => update({ language: e.target.value })}
            />
          </div>

          {/* Price range */}
          <div className="md:col-span-3 flex items-center gap-2">
            <div className="relative w-full">
              <PoundSterling className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20"
                placeholder="Min £/hr"
                inputMode="numeric"
                defaultValue={sp.get('minPrice') || ''}
                onBlur={(e) => update({ minPrice: e.target.value || undefined })}
              />
            </div>
            <span className="text-gray-400">–</span>
            <div className="relative w-full">
              <PoundSterling className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20"
                placeholder="Max £/hr"
                inputMode="numeric"
                defaultValue={sp.get('maxPrice') || ''}
                onBlur={(e) => update({ maxPrice: e.target.value || undefined })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[200px]">
        {loading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                <div className="h-40 w-full bg-gray-100" />
                <div className="p-4 space-y-2">
                  <div className="h-4 w-2/3 rounded bg-gray-200" />
                  <div className="h-3 w-1/3 rounded bg-gray-200" />
                </div>
                <div className="animate-pulse absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100" />
              </div>
            ))}
          </div>
        )}

        {!!err && !loading && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            Failed to load: {err}
          </div>
        )}

        {!loading && !err && (
          <>
            {data?.items?.length ? (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {data.items.map((t) => (
                    <TutorCard key={t._id} tutor={t} />
                  ))}
                </div>

                {/* Pagination */}
                <div className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
                  <div className="text-sm text-gray-600">
                    Page <span className="font-medium">{data.page}</span> of{' '}
                    <span className="font-medium">{totalPages}</span> •{' '}
                    <span className="font-medium">{total}</span> tutors
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="inline-flex items-center gap-1.5 rounded-xl border bg-white px-3 py-2 text-sm shadow-sm hover:bg-gray-50 disabled:opacity-50"
                      disabled={page <= 1}
                      onClick={() => update({ page: String(page - 1) })}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Prev
                    </button>
                    <button
                      className="inline-flex items-center gap-1.5 rounded-xl border bg-white px-3 py-2 text-sm shadow-sm hover:bg-gray-50 disabled:opacity-50"
                      disabled={page >= totalPages}
                      onClick={() => update({ page: String(page + 1) })}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-2xl border bg-white p-10 text-center shadow-sm">
                <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-gray-100">
                  <Search className="h-6 w-6 text-gray-500" />
                </div>
                <div className="font-medium">No tutors found</div>
                <p className="mt-1 text-sm text-gray-600">Try adjusting your filters.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Back to home */}
      <div className="pt-2">
        <Link to="/" className="text-sm text-blue-700 hover:underline">← Back to Home</Link>
      </div>
    </div>
  );
}
