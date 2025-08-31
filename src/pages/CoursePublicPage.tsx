import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getCourseBySlug, type CoursePublic, getOwned, createCourseCheckout } from '@/lib/courses.api';
import { enrollInCourse } from '@/lib/enrollments.api';
import { tryGetEnrolledCourseBySlug } from '@/lib/meLearning.api';
import { useAuth } from '@/context/AuthProvider';

function formatPrice(p?: { amountMinor?: number; currency?: 'GBP'|'USD'|'EUR'; isFree?: boolean }) {
  if (!p || p.isFree || !p.amountMinor) return 'Free';
  const n = (p.amountMinor || 0) / 100;
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: p.currency || 'GBP' }).format(n);
  } catch {
    return `${n.toFixed(2)} ${p.currency || ''}`;
  }
}
function secondsToHms(sec?: number) {
  const s = Math.max(0, Number(sec||0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h) return `${h}h ${m}m`;
  if (m) return `${m}m`;
  return `${s}s`;
}

export default function CoursePublicPage() {
  const { slug = '' } = useParams();
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const location = useLocation();

  // --- data ---
  const qCourse = useQuery({
    queryKey: ['publicCourse', slug],
    queryFn: () => getCourseBySlug(slug),
    enabled: !!slug,
    staleTime: 10_000,
  });

  // If logged in, check if already enrolled (purchase webhook or previous enrollment)
  const qEnrolled = useQuery({
    queryKey: ['enrolledCheck', slug],
    queryFn: () => tryGetEnrolledCourseBySlug(slug),
    enabled: !!slug && !!user && !loading,
    gcTime: 5 * 60_000,
    staleTime: 10_000,
  });

  // If logged in, check if user "owns" access (membership covers or purchased)
  const qOwned = useQuery({
    queryKey: ['owned', slug],
    queryFn: () => getOwned(slug),
    enabled: !!slug && !!user && !loading,
    staleTime: 5_000,
  });

  
  const mEnroll = useMutation({
    mutationFn: async (courseId: string) => enrollInCourse(courseId),
    onSuccess: () => { nav(`/learn/${slug}`, { replace: true }); },
  });

  const mCheckout = useMutation({
    mutationFn: async (courseId: string) => createCourseCheckout(courseId),
    onSuccess: (d) => { if (d?.checkoutUrl) window.location.href = d.checkoutUrl; },
  });

  // --- derived ---
  const course: CoursePublic | undefined = qCourse.data;
  const priceText = course ? formatPrice(course.pricing) : '';
  const isFree = !!course?.pricing?.isFree || !course?.pricing?.amountMinor;
  const includedByMembership = !!course?.pricing?.includedInMembership;
  const enrolled = !!qEnrolled.data;
  const owned = !!qOwned.data;               // membership covers OR already purchased
  const checking = qEnrolled.isLoading || qOwned.isLoading;

  const infoChips = useMemo(() => {
    if (!course) return [] as string[];
    const chips: string[] = [];
    if (course.level) chips.push(course.level);
    if (course.language) chips.push(course.language);
    if (course.totalDurationSec != null) chips.push(secondsToHms(course.totalDurationSec));
    return chips;
  }, [course]);

  // After returning from Stripe (?purchase=success), poll a few seconds while webhook lands
  const [confirming, setConfirming] = useState(false);
  useEffect(() => {
    const qp = new URLSearchParams(location.search);
    if (qp.get('purchase') === 'success' && user) {
      setConfirming(true);
      let tries = 0;
      const id = setInterval(async () => {
        tries++;
        await qEnrolled.refetch();
        if (qEnrolled.data || tries > 10) { // ~8s max
          setConfirming(false);
          clearInterval(id);
        }
      }, 800);
      return () => clearInterval(id);
    }
  }, [location.search, user, qEnrolled]);

  // --- UI ---
  if (qCourse.isLoading) {
    return (
      <div className="mx-auto max-w-5xl p-4 sm:p-6">
        <div className="grid gap-6 md:grid-cols-[280px,1fr]">
          <div className="h-40 rounded bg-gray-100 animate-pulse" />
          <div className="space-y-3">
            <div className="h-7 w-2/3 rounded bg-gray-100 animate-pulse" />
            <div className="h-4 w-1/2 rounded bg-gray-100 animate-pulse" />
            <div className="h-24 rounded bg-gray-100 animate-pulse" />
            <div className="h-10 w-40 rounded bg-gray-100 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (qCourse.isError || !course) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="rounded border p-6 text-red-600">Course not found or failed to load.</div>
      </div>
    );
  }

  const courseId = (course as any)?.id ?? (course as any)?._id;


  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6 space-y-6">
      <div className="grid gap-6 md:grid-cols-[320px,1fr]">
        <div className="aspect-video w-full overflow-hidden rounded-lg border bg-gray-50">
          {course.thumbnail ? (
            <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-gray-400">No thumbnail</div>
          )}
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl font-semibold">{course.title}</h1>
          {course.subtitle && <p className="text-gray-700">{course.subtitle}</p>}

          <div className="flex flex-wrap items-center gap-2">
            {infoChips.map((c) => (
              <span key={c} className="rounded-full border px-2.5 py-1 text-xs text-gray-700">{c}</span>
            ))}
            <span className="ml-auto text-lg font-semibold">{priceText}</span>
          </div>

          {course.description && (
            <p className="text-sm leading-6 text-gray-700 whitespace-pre-line">
              {course.description}
            </p>
          )}

          <div className="pt-2 flex flex-wrap items-center gap-2">
            {/* CTA decision tree */}
            {enrolled ? (
              <Link
                to={`/learn/${encodeURIComponent(course.slug)}`}
                className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-white hover:opacity-95"
              >
                Go to course
              </Link>
            ) : !user ? (
              <Link
              to={`/login?next=${encodeURIComponent(`/courses/${course.slug}`)}`}
              className="inline-flex items-center rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
              >
                Log in to continue
              </Link>
            ) : isFree ? (
              <button
                onClick={() => mEnroll.mutate(courseId)}
                disabled={mEnroll.isPending}
                className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-white hover:opacity-95 disabled:opacity-60"
              >
                {mEnroll.isPending ? 'Enrolling…' : 'Enroll for free'}
              </button>
            ) : owned ? (
              // Owned but not enrolled yet → likely membership covers it; create membership enrollment now
              <button
                onClick={() => mEnroll.mutate(courseId)}
                disabled={mEnroll.isPending}
                className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-white hover:opacity-95 disabled:opacity-60"
              >
                {mEnroll.isPending ? 'Starting…' : 'Start with membership'}
              </button>
            ) : (
              <>
                <button
                  onClick={() => mCheckout.mutate(courseId)}
                  disabled={mCheckout.isPending}
                  className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-white hover:opacity-95 disabled:opacity-60"
                >
                  {mCheckout.isPending ? 'Redirecting…' : `Buy course — ${priceText}`}
                </button>
                {includedByMembership && (
                  <Link
                    to="/billing/plans"
                    className="inline-flex items-center rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    Or get Lifetime access
                  </Link>
                )}
              </>
            )}

            {(checking || confirming) && (
              <span className="text-xs text-gray-500">
                {confirming ? 'Confirming your purchase…' : 'Checking access…'}
              </span>
            )}
          </div>

          {Array.isArray(course.tags) && course.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {course.tags.map(t => (
                <span key={t} className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700">#{t}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {Array.isArray(course.sections) && course.sections.length > 0 && (
        <div className="rounded-lg border bg-white p-4">
          <div className="mb-2 text-sm font-semibold">Syllabus preview</div>
          <div className="space-y-3">
            {course.sections.slice(0, 6).map((s) => (
              <div key={String(s.id)} className="rounded border px-3 py-2">
                <div className="text-sm font-medium">{s.title}</div>
                {!!s.lessons?.length && (
                  <ul className="mt-1 list-disc pl-5 text-xs text-gray-700">
                    {s.lessons.slice(0, 4).map(l => (
                      <li key={String((l as any).id)} className="truncate">{(l as any).title}</li>
                    ))}
                    {s.lessons.length > 4 && <li className="text-gray-500">…and {s.lessons.length - 4} more</li>}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
