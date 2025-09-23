// import { Link, useSearchParams } from "react-router-dom";
// import { useQuestions } from "@/lib/discussions.api";
// import { StatusBadge } from "@/components/discussions/RoleBadges";
// import { Search, Filter, MessageSquarePlus, CheckCircle2, CircleDashed, ChevronLeft, ChevronRight } from "lucide-react";

// export default function DiscussionsListPage() {
//   const [sp, setSp] = useSearchParams();
//   const params = {
//     page: Number(sp.get("page") || 1),
//     limit: 20,
//     q: sp.get("q") || undefined,
//     sort: (sp.get("sort") as any) || "newest",
//     status: sp.get("status") || undefined,
//   };
//   const { data, isLoading } = useQuestions(params);

//   function set(key: string, val?: string) {
//     const next = new URLSearchParams(sp);
//     if (!val) next.delete(key);
//     else next.set(key, val);
//     if (key !== "page") next.set("page", "1");
//     setSp(next, { replace: true });
//   }

//   return (
//     <div className="container-app py-6 space-y-5">
//       {/* Header */}
//       <div className="flex flex-wrap items-center justify-between gap-3">
//         <h1 className="text-2xl font-semibold tracking-tight">Discussions</h1>
//         <Link to="/discussions/ask" className="btn btn-primary h-10 px-4 text-sm inline-flex items-center gap-2">
//           <MessageSquarePlus className="h-4 w-4" />
//           Ask Question
//         </Link>
//       </div>

//       {/* Filters */}
//       <div className="flex flex-wrap items-center gap-2">
//         <div className="relative">
//           <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
//           <input
//             className="h-10 rounded-lg border border-gray-300 pl-9 pr-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/30"
//             placeholder="Search..."
//             defaultValue={params.q}
//             onKeyDown={(e) => {
//               if (e.key === "Enter") {
//                 set("q", (e.target as HTMLInputElement).value || undefined);
//               }
//             }}
//           />
//         </div>

//         <div className="flex items-center gap-2">
//           <div className="relative">
//             <Filter className="pointer-events-none absolute left-2.5 top-[9px] h-4 w-4 text-gray-400" />
//             <select
//               className="h-10 rounded-lg border border-gray-300 pl-8 pr-2 text-sm"
//               value={params.sort}
//               onChange={(e) => set("sort", e.target.value)}
//             >
//               <option value="newest">Newest</option>
//               <option value="unanswered">Unanswered</option>
//               <option value="active">Active</option>
//             </select>
//           </div>

//           <button
//             className={`h-10 px-3 rounded-lg border text-sm inline-flex items-center gap-1.5 ${
//               params.status === "answered" ? "bg-blue-50 text-blue-700 border-blue-200" : ""
//             }`}
//             onClick={() => set("status", params.status === "answered" ? undefined : "answered")}
//           >
//             <CheckCircle2 className="h-4 w-4" /> Answered
//           </button>

//           <button
//             className={`h-10 px-3 rounded-lg border text-sm inline-flex items-center gap-1.5 ${
//               params.status === "open" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : ""
//             }`}
//             onClick={() => set("status", params.status === "open" ? undefined : "open")}
//           >
//             <CircleDashed className="h-4 w-4" /> Open
//           </button>
//         </div>
//       </div>

//       {/* List */}
//       <div className="rounded-xl border bg-white divide-y shadow-sm">
//         {isLoading && <div className="p-4 text-gray-500 text-sm">Loading...</div>}
//         {!isLoading && data?.items?.length === 0 && (
//           <div className="p-4 text-gray-500 text-sm">No questions yet.</div>
//         )}

//         {data?.items?.map((q: any) => (
//           <Link key={q._id} to={`/discussions/${q._id}`} className="block p-4 hover:bg-gray-50 transition">
//             <div className="flex items-start gap-3">
//               <div className="flex-1 min-w-0">
//                 <div className="flex items-center gap-2">
//                   <h2 className="text-base font-medium leading-6 truncate">{q.title}</h2>
//                   <StatusBadge status={q.status} />
//                 </div>
//                 <div className="mt-1 line-clamp-1 text-gray-600 text-sm">{q.body}</div>
//               </div>
//               <div className="shrink-0 text-right text-xs text-gray-500">
//                 {q.answersCount} answers
//               </div>
//             </div>
//           </Link>
//         ))}
//       </div>

//       {/* Pagination */}
//       {data?.total > data?.limit && (
//         <div className="flex items-center justify-center gap-2">
//           <button
//             className="btn h-9 inline-flex items-center gap-1.5"
//             disabled={params.page <= 1}
//             onClick={() => set("page", String(params.page - 1))}
//           >
//             <ChevronLeft className="h-4 w-4" />
//             Prev
//           </button>
//           <div className="text-sm text-gray-600">
//             Page {params.page} / {Math.ceil(data.total / data.limit)}
//           </div>
//           <button
//             className="btn h-9 inline-flex items-center gap-1.5"
//             disabled={params.page >= Math.ceil(data.total / data.limit)}
//             onClick={() => set("page", String(params.page + 1))}
//           >
//             Next
//             <ChevronRight className="h-4 w-4" />
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }


import { Link, useSearchParams } from "react-router-dom";
import { useQuestions } from "@/lib/discussions.api";
import { StatusBadge } from "@/components/discussions/RoleBadges";
import {
  Search,
  Filter,
  MessageSquarePlus,
  CheckCircle2,
  CircleDashed,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function DiscussionsListPage() {
  const [sp, setSp] = useSearchParams();
  const params = {
    page: Number(sp.get("page") || 1),
    limit: 20,
    q: sp.get("q") || undefined,
    sort: (sp.get("sort") as any) || "newest",
    status: sp.get("status") || undefined,
  };
  const { data, isLoading } = useQuestions(params);

  function set(key: string, val?: string) {
    const next = new URLSearchParams(sp);
    if (!val) next.delete(key);
    else next.set(key, val);
    if (key !== "page") next.set("page", "1");
    setSp(next, { replace: true });
  }

  return (
    <div className="container-app py-6 space-y-6">
      {/* Header */}
      <div className="rounded-2xl border bg-gradient-to-br from-white to-gray-50/60 p-5 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Discussions</h1>
          <p className="text-sm text-gray-600">
            Ask questions and get answers from instructors and learners.
          </p>
        </div>
        <Link
          to="/discussions/ask"
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-white shadow-sm hover:shadow transition"
        >
          <MessageSquarePlus className="h-4 w-4" />
          Ask Question
        </Link>
      </div>

      {/* Filters */}
      <div className="sticky top-0 z-10 -mx-2 md:mx-0 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-y md:border rounded-none md:rounded-xl md:border md:py-3 md:px-4 px-2 py-2">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              className="h-10 w-64 rounded-xl border border-gray-300 pl-9 pr-3 text-sm outline-none transition focus:ring-4 focus:ring-primary/20 focus:border-primary"
              placeholder="Search questions…"
              defaultValue={params.q}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  set("q", (e.target as HTMLInputElement).value || undefined);
                }
              }}
            />
          </div>

          {/* Sort */}
          <div className="relative">
            <Filter className="pointer-events-none absolute left-2.5 top-[9px] h-4 w-4 text-gray-400" />
            <select
              className="h-10 rounded-xl border border-gray-300 pl-8 pr-8 text-sm appearance-none bg-white pr-8"
              value={params.sort}
              onChange={(e) => set("sort", e.target.value)}
            >
              <option value="newest">Newest</option>
              <option value="unanswered">Unanswered</option>
              <option value="active">Active</option>
            </select>
          </div>

          {/* Status chips */}
          <button
            className={`h-9 px-3 rounded-full border text-sm inline-flex items-center gap-1.5 transition ${
              params.status === "answered"
                ? "bg-blue-50 text-blue-700 border-blue-200 shadow-xs"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
            onClick={() => set("status", params.status === "answered" ? undefined : "answered")}
          >
            <CheckCircle2 className="h-4 w-4" /> Answered
          </button>

          <button
            className={`h-9 px-3 rounded-full border text-sm inline-flex items-center gap-1.5 transition ${
              params.status === "open"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-xs"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
            onClick={() => set("status", params.status === "open" ? undefined : "open")}
          >
            <CircleDashed className="h-4 w-4" /> Open
          </button>
        </div>
      </div>

      {/* List */}
      <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
        {isLoading && (
          <div className="p-4 text-gray-500 text-sm">
            Loading…
            <div className="mt-3 grid gap-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-lg bg-gray-100" />
              ))}
            </div>
          </div>
        )}

        {!isLoading && data?.items?.length === 0 && (
          <div className="p-10 text-center">
            <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600">No questions yet. Be the first to ask!</p>
            <Link
              to="/discussions/ask"
              className="mt-3 inline-flex h-9 items-center justify-center rounded-lg border px-3 text-sm hover:bg-gray-50"
            >
              Ask a question
            </Link>
          </div>
        )}

        {data?.items?.map((q: any, idx: number) => (
          <Link
            key={q._id}
            to={`/discussions/${q._id}`}
            className={`block p-4 transition group relative ${
              idx !== data.items.length - 1 ? "border-b" : ""
            } hover:bg-gray-50/60`}
          >
            <div className="flex items-start gap-4">
              {/* Answers count pill */}
              <div className="shrink-0">
                <div className="min-w-14 rounded-xl border bg-white px-3 py-2 text-center shadow-xs">
                  <div className="text-xs text-gray-500">Answers</div>
                  <div className="text-sm font-semibold">{q.answersCount}</div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-[15px] font-medium leading-6 truncate group-hover:text-gray-900">
                    {q.title}
                  </h2>
                  <StatusBadge status={q.status} />
                </div>
                <div className="mt-1 text-gray-600 text-sm line-clamp-2">{q.body}</div>
              </div>

              {/* Chevron (visual only) */}
              <div className="ml-2 hidden sm:block shrink-0 self-center text-gray-300 group-hover:text-gray-400">
                <ChevronRight className="h-5 w-5" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {data?.total > data?.limit && (
        <div className="flex items-center justify-center gap-3">
          <button
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border bg-white px-3 text-sm shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={params.page <= 1}
            onClick={() => set("page", String(params.page - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </button>
          <div className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
            Page <span className="font-medium">{params.page}</span> /{" "}
            {Math.ceil((data?.total || 0) / (data?.limit || 1))}
          </div>
          <button
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border bg-white px-3 text-sm shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={params.page >= Math.ceil(data.total / data.limit)}
            onClick={() => set("page", String(params.page + 1))}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
