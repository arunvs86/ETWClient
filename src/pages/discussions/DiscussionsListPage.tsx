import { Link, useSearchParams } from "react-router-dom";
import { useQuestions } from "@/lib/discussions.api";
import { StatusBadge } from "@/components/discussions/RoleBadges";

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
    if (!val) next.delete(key); else next.set(key, val);
    setSp(next, { replace: true });
  }

  return (
    <div className="container-app py-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Discussions</h1>
        <Link to="/discussions/ask" className="btn btn-primary h-9 px-3 text-sm">Ask Question</Link>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          className="h-9 rounded-md border px-3 text-sm"
          placeholder="Search..."
          defaultValue={params.q}
          onKeyDown={(e)=>{ if(e.key==="Enter"){ set("q", (e.target as HTMLInputElement).value || undefined); } }}
        />
        <select className="h-9 rounded-md border px-2 text-sm" value={params.sort} onChange={e=>set("sort", e.target.value)}>
          <option value="newest">Newest</option>
          <option value="unanswered">Unanswered</option>
          <option value="active">Active</option>
        </select>
        <button className={`h-9 px-3 rounded-md border text-sm ${params.status==="answered"?"bg-blue-50":""}`} onClick={()=>set("status", params.status==="answered"?undefined:"answered")}>Answered</button>
        <button className={`h-9 px-3 rounded-md border text-sm ${params.status==="open"?"bg-emerald-50":""}`} onClick={()=>set("status", params.status==="open"?undefined:"open")}>Open</button>
      </div>

      <div className="rounded-lg border bg-white divide-y">
        {isLoading && <div className="p-4 text-gray-500 text-sm">Loading...</div>}
        {!isLoading && data?.items?.length === 0 && <div className="p-4 text-gray-500 text-sm">No questions yet.</div>}
        {data?.items?.map((q: any) => (
          <Link key={q._id} to={`/discussions/${q._id}`} className="block p-3 hover:bg-gray-50">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-medium">{q.title}</h2>
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

      {data?.total > data?.limit && (
        <div className="flex items-center justify-center gap-2">
          <button className="btn h-9" disabled={params.page<=1} onClick={()=>set("page", String(params.page-1))}>Prev</button>
          <div className="text-sm text-gray-600">
            Page {params.page} / {Math.ceil(data.total / data.limit)}
          </div>
          <button className="btn h-9" disabled={params.page >= Math.ceil(data.total / data.limit)} onClick={()=>set("page", String(params.page+1))}>Next</button>
        </div>
      )}
    </div>
  );
}
