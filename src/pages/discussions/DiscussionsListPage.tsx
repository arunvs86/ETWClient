// import { Link, useSearchParams } from "react-router-dom";
// import { useQuestions } from "@/lib/discussions.api";
// import { StatusBadge } from "@/components/discussions/RoleBadges";

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
//     if (!val) next.delete(key); else next.set(key, val);
//     setSp(next, { replace: true });
//   }

//   return (
//     <div className="container-app py-6 space-y-4">
//       <div className="flex flex-wrap items-center justify-between gap-3">
//         <h1 className="text-xl font-semibold">Discussions</h1>
//         <Link to="/discussions/ask" className="btn btn-primary h-9 px-3 text-sm">Ask Question</Link>
//       </div>

//       <div className="flex flex-wrap items-center gap-2">
//         <input
//           className="h-9 rounded-md border px-3 text-sm"
//           placeholder="Search..."
//           defaultValue={params.q}
//           onKeyDown={(e)=>{ if(e.key==="Enter"){ set("q", (e.target as HTMLInputElement).value || undefined); } }}
//         />
//         <select className="h-9 rounded-md border px-2 text-sm" value={params.sort} onChange={e=>set("sort", e.target.value)}>
//           <option value="newest">Newest</option>
//           <option value="unanswered">Unanswered</option>
//           <option value="active">Active</option>
//         </select>
//         <button className={`h-9 px-3 rounded-md border text-sm ${params.status==="answered"?"bg-blue-50":""}`} onClick={()=>set("status", params.status==="answered"?undefined:"answered")}>Answered</button>
//         <button className={`h-9 px-3 rounded-md border text-sm ${params.status==="open"?"bg-emerald-50":""}`} onClick={()=>set("status", params.status==="open"?undefined:"open")}>Open</button>
//       </div>

//       <div className="rounded-lg border bg-white divide-y">
//         {isLoading && <div className="p-4 text-gray-500 text-sm">Loading...</div>}
//         {!isLoading && data?.items?.length === 0 && <div className="p-4 text-gray-500 text-sm">No questions yet.</div>}
//         {data?.items?.map((q: any) => (
//           <Link key={q._id} to={`/discussions/${q._id}`} className="block p-3 hover:bg-gray-50">
//             <div className="flex items-start gap-3">
//               <div className="flex-1">
//                 <div className="flex items-center gap-2">
//                   <h2 className="text-base font-medium">{q.title}</h2>
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

//       {data?.total > data?.limit && (
//         <div className="flex items-center justify-center gap-2">
//           <button className="btn h-9" disabled={params.page<=1} onClick={()=>set("page", String(params.page-1))}>Prev</button>
//           <div className="text-sm text-gray-600">
//             Page {params.page} / {Math.ceil(data.total / data.limit)}
//           </div>
//           <button className="btn h-9" disabled={params.page >= Math.ceil(data.total / data.limit)} onClick={()=>set("page", String(params.page+1))}>Next</button>
//         </div>
//       )}
//     </div>
//   );
// }


import { Link, useSearchParams } from "react-router-dom";
import { useQuestions } from "@/lib/discussions.api";
import { StatusBadge } from "@/components/discussions/RoleBadges";
import { Search, Filter, MessageSquarePlus, CheckCircle2, CircleDashed, ChevronLeft, ChevronRight } from "lucide-react";

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
    <div className="container-app py-6 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Discussions</h1>
        <Link to="/discussions/ask" className="btn btn-primary h-10 px-4 text-sm inline-flex items-center gap-2">
          <MessageSquarePlus className="h-4 w-4" />
          Ask Question
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            className="h-10 rounded-lg border border-gray-300 pl-9 pr-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/30"
            placeholder="Search..."
            defaultValue={params.q}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                set("q", (e.target as HTMLInputElement).value || undefined);
              }
            }}
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Filter className="pointer-events-none absolute left-2.5 top-[9px] h-4 w-4 text-gray-400" />
            <select
              className="h-10 rounded-lg border border-gray-300 pl-8 pr-2 text-sm"
              value={params.sort}
              onChange={(e) => set("sort", e.target.value)}
            >
              <option value="newest">Newest</option>
              <option value="unanswered">Unanswered</option>
              <option value="active">Active</option>
            </select>
          </div>

          <button
            className={`h-10 px-3 rounded-lg border text-sm inline-flex items-center gap-1.5 ${
              params.status === "answered" ? "bg-blue-50 text-blue-700 border-blue-200" : ""
            }`}
            onClick={() => set("status", params.status === "answered" ? undefined : "answered")}
          >
            <CheckCircle2 className="h-4 w-4" /> Answered
          </button>

          <button
            className={`h-10 px-3 rounded-lg border text-sm inline-flex items-center gap-1.5 ${
              params.status === "open" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : ""
            }`}
            onClick={() => set("status", params.status === "open" ? undefined : "open")}
          >
            <CircleDashed className="h-4 w-4" /> Open
          </button>
        </div>
      </div>

      {/* List */}
      <div className="rounded-xl border bg-white divide-y shadow-sm">
        {isLoading && <div className="p-4 text-gray-500 text-sm">Loading...</div>}
        {!isLoading && data?.items?.length === 0 && (
          <div className="p-4 text-gray-500 text-sm">No questions yet.</div>
        )}

        {data?.items?.map((q: any) => (
          <Link key={q._id} to={`/discussions/${q._id}`} className="block p-4 hover:bg-gray-50 transition">
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-medium leading-6 truncate">{q.title}</h2>
                  <StatusBadge status={q.status} />
                </div>
                <div className="mt-1 line-clamp-1 text-gray-600 text-sm">{q.body}</div>
              </div>
              <div className="shrink-0 text-right text-xs text-gray-500">
                {q.answersCount} answers
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {data?.total > data?.limit && (
        <div className="flex items-center justify-center gap-2">
          <button
            className="btn h-9 inline-flex items-center gap-1.5"
            disabled={params.page <= 1}
            onClick={() => set("page", String(params.page - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </button>
          <div className="text-sm text-gray-600">
            Page {params.page} / {Math.ceil(data.total / data.limit)}
          </div>
          <button
            className="btn h-9 inline-flex items-center gap-1.5"
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
