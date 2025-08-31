import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthProvider';
import { listMyEnrollments, type EnrollmentCard } from '@/lib/enrollments.api';

function Card({ enr }: { enr: EnrollmentCard }) {
  const c = enr.course;
  return (
    <div className="min-w-[260px] max-w-[320px] snap-start rounded-xl ring-1 ring-black/5 bg-white overflow-hidden">
      <Link to={`/learn/${encodeURIComponent(c.slug)}`} className="block">
        <div className="aspect-video bg-gray-50">
          {c.thumbnail
            ? <img src={c.thumbnail} alt={c.title} className="h-full w-full object-cover" />
            : <div className="flex h-full items-center justify-center text-sm text-gray-400">No thumbnail</div>}
        </div>
      </Link>
      <div className="p-3">
        <Link to={`/learn/${encodeURIComponent(c.slug)}`} className="line-clamp-2 text-sm font-medium hover:underline">
          {c.title}
        </Link>
        <div className="mt-1 text-[11px] text-gray-500">Activated {new Date(enr.activatedAt).toLocaleDateString()}</div>
        <div className="mt-3">
          <Link to={`/learn/${encodeURIComponent(c.slug)}`}
                className="inline-flex h-8 items-center rounded-md bg-primary px-3 text-white hover:opacity-95">
            Continue
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ContinueLearningRail() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ['me', 'enrollments', 1, 12],
    queryFn: () => listMyEnrollments(1, 12),
    enabled: !!user,
    staleTime: 15_000,
  });

  if (!user) return null;
  const items = data?.items ?? [];
  if (!isLoading && items.length === 0) return null;

  return (
    <section className="container-app space-y-3">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">Continue learning</h2>
          <p className="text-sm text-muted-foreground">Pick up where you left off</p>
        </div>
        <Link to="/me/enrollments" className="text-sm font-medium text-primary hover:underline">Go to My Learning</Link>
      </div>

      {isLoading ? (
        <div className="flex gap-4 overflow-x-auto no-scrollbar">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="min-w-[260px] max-w-[320px] rounded-xl ring-1 ring-black/5 p-3 animate-pulse">
              <div className="aspect-video rounded bg-gray-200" />
              <div className="mt-3 h-4 w-2/3 rounded bg-gray-200" />
              <div className="mt-2 h-3 w-1/3 rounded bg-gray-200" />
              <div className="mt-3 h-8 w-24 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar">
          {items.map((enr) => <Card key={enr.enrollmentId || `${enr.userId}-${enr.courseId}`} enr={enr} />)}
        </div>
      )}
    </section>
  );
}
