import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import Button from "../ui/Button";

type CourseCard = {
  _id: string;
  slug: string;
  title: string;
  thumbnailUrl?: string;
  instructorName?: string;
  updatedAt?: string;
  isFree?: boolean;
  price?: number;
};

function useFeaturedCourses() {
  return useQuery({
    queryKey: ["featured-courses"],
    queryFn: async () => {
      const { data } = await api.get<{ items: CourseCard[] }>("/courses", {
        params: { limit: 6, sort: "-updatedAt", status: "published" },
      });
      return data.items;
    },
  });
}

export default function FeaturedCourses() {
  const { data, isLoading } = useFeaturedCourses();

  return (
    <section className="container-app space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold">Featured Courses</h2>
          <p className="text-muted-foreground">Fresh, practical, and career-ready.</p>
        </div>
        <Link to="/courses">
          <Button variant="secondary">View all</Button>
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {(isLoading ? Array.from({ length: 6 }) : data || []).map((c, i) => (
          <article key={c?._id ?? i} className="group rounded-2xl border bg-white overflow-hidden">
            <Link to={c ? `/course/${c.slug}` : "#"} className="block">
              <div className="aspect-[16/9] w-full bg-muted overflow-hidden">
                {c?.thumbnailUrl ? (
                  <img
                    src={c.thumbnailUrl}
                    alt={c.title}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover group-hover:scale-[1.03] transition"
                  />
                ) : (
                  <img
                    src="/images/course-placeholder.webp"
                    alt=""
                    className="h-full w-full object-cover opacity-80"
                    loading="lazy"
                    decoding="async"
                  />
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {c?.isFree ? <span className="rounded bg-emerald-50 px-2 py-0.5 text-emerald-700">Free</span> :
                    <span className="rounded bg-primary/10 px-2 py-0.5 text-primary">{c?.price ? `£${c.price}` : "Membership"}</span>}
                </div>
                <h3 className="mt-2 font-semibold line-clamp-2">{c?.title ?? "Loading…"}</h3>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-1">{c?.instructorName ?? ""}</p>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
