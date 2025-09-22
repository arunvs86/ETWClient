// import { useMemo } from "react";
// import { Link } from "react-router-dom";
// import { useQuery } from "@tanstack/react-query";
// import { listLiveSessions, prettyPrice, type PublicLiveSession } from "@/lib/liveSessions.api";

// /**
//  * Home page "Upcoming Live Sessions" rail
//  * - Always visible (no auth required)
//  * - Mobile: horizontal scroll
//  * - md+: responsive grid
//  */
// export default function UpcomingLiveSessions({ limit = 6 }: { limit?: number }) {
//   const { data, isLoading, isError, refetch, isFetching } = useQuery({
//     queryKey: ["homeUpcomingLive", { limit }],
//     queryFn: () =>
//       listLiveSessions({
//         status: "scheduled",
//         visibility: "public",
//         page: 1,
//         limit,
//       }),
//     staleTime: 30_000,
//     keepPreviousData: true,
//   });

//   const items = useMemo<PublicLiveSession[]>(() => data?.results || [], [data]);

//   return (
//     <section className="container-app space-y-6">
//       <div className="flex items-end justify-between gap-3">
//         <div>
//           <h2 className="text-2xl md:text-3xl font-bold">Upcoming live sessions</h2>
//           <p className="text-sm text-muted-foreground">
//             Join interactive classes, Q&A, and workshops — some are free.
//           </p>
//         </div>
//         <Link to="/live" className="text-sm font-medium text-primary hover:underline">
//           View all
//         </Link>
//       </div>

//       {/* Loading state */}
//       {isLoading ? (
//         <Rail>
//           {Array.from({ length: Math.min(limit, 6) }).map((_, i) => (
//             <CardSkeleton key={i} />
//           ))}
//         </Rail>
//       ) : isError ? (
//         <div className="rounded-xl border bg-white p-6 text-sm">
//           <p className="text-red-600">Couldn’t load live sessions.</p>
//           <button
//             onClick={() => refetch()}
//             className="mt-2 inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
//           >
//             Try again
//           </button>
//         </div>
//       ) : items.length === 0 ? (
//         <div className="rounded-xl border bg-white p-6 text-sm text-muted-foreground">
//           No upcoming sessions yet — check back soon.
//         </div>
//       ) : (
//         <Rail>
//           {items.map((s) => (
//             <LiveCard key={s.id} s={s} />
//           ))}
//           {/* while refetching, show a subtle loader card */}
//           {isFetching && <CardSkeleton />}
//         </Rail>
//       )}
//     </section>
//   );
// }

// /* ---------- UI bits ---------- */

// function Rail({ children }: { children: React.ReactNode }) {
//   // mobile: horizontal scroll; md+: grid
//   return (
//     <div className="md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6">
//       <div className="flex md:block snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pr-2 no-scrollbar md:overflow-visible">
//         {/* each child should size well in both contexts */}
//         {Array.isArray(children)
//           ? children.map((child, i) => (
//               <div
//                 key={i}
//                 className="min-w-[260px] max-w-[320px] flex-1 snap-start md:min-w-0 md:max-w-none md:block"
//               >
//                 {child}
//               </div>
//             ))
//           : children}
//       </div>
//     </div>
//   );
// }

// function LiveCard({ s }: { s: PublicLiveSession }) {
//   const when = formatDateRange(s.startAt, s.endAt, s.timezone);
//   const price = prettyPrice(s.pricing);
//   const isFree = (s.pricing?.type ?? "free") === "free";

//   return (
//     <article className="group overflow-hidden rounded-xl ring-1 ring-black/5 bg-white transition hover:shadow-md">
//       <div className="relative aspect-[16/9] bg-muted">
//         <img
//           src={s.thumbnail || "/images/course-placeholder.avif"}
//           alt=""
//           loading="lazy"
//           decoding="async"
//           className="h-full w-full object-cover transition group-hover:scale-[1.02]"
//         />
//         <span className="absolute left-2 top-2 rounded bg-white/90 px-2 py-0.5 text-[11px] font-medium ring-1 ring-black/10">
//           {s.status === "scheduled" ? "Scheduled" : s.status}
//         </span>
//       </div>

//       <div className="p-4">
//         <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug">{s.title}</h3>
//         {s.description && (
//           <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{s.description}</p>
//         )}

//         <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
//           <div className="text-muted-foreground">{when}</div>
//           <div className={isFree ? "text-emerald-600 font-semibold" : "font-semibold"}>{price}</div>
//         </div>

//         <div className="mt-3 flex items-center justify-between">
//           <Link
//             to={`/live/${encodeURIComponent(s.id)}`}
//             className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
//           >
//             Details
//           </Link>
//           {s.capacity ? (
//             <span className="text-xs text-muted-foreground">Capacity: {s.capacity}</span>
//           ) : (
//             <span className="text-xs text-muted-foreground">Unlimited</span>
//           )}
//         </div>
//       </div>
//     </article>
//   );
// }

// function CardSkeleton() {
//   return (
//     <div className="overflow-hidden rounded-xl ring-1 ring-black/5 bg-white">
//       <div className="animate-pulse">
//         <div className="h-[160px] bg-gray-200" />
//         <div className="p-4 space-y-3">
//           <div className="h-4 w-3/4 bg-gray-200 rounded" />
//           <div className="h-3 w-5/6 bg-gray-200 rounded" />
//           <div className="h-3 w-2/3 bg-gray-200 rounded" />
//           <div className="h-8 w-24 bg-gray-200 rounded mt-2" />
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ---------- utils ---------- */

// function formatDateRange(startISO: string, endISO?: string, tz?: string) {
//   // default to Europe/London (your app timezone)
//   const timeZone = tz || "Europe/London";
//   try {
//     const start = new Date(startISO);
//     const end = endISO ? new Date(endISO) : undefined;
//     const dateFmt = new Intl.DateTimeFormat(undefined, {
//       timeZone,
//       weekday: "short",
//       day: "2-digit",
//       month: "short",
//     });
//     const timeFmt = new Intl.DateTimeFormat(undefined, {
//       timeZone,
//       hour: "2-digit",
//       minute: "2-digit",
//       hour12: false,
//     });

//     const d = dateFmt.format(start);
//     const t1 = timeFmt.format(start);
//     if (end) {
//       const sameDay =
//         start.toLocaleDateString("en-GB", { timeZone }) ===
//         end.toLocaleDateString("en-GB", { timeZone });
//       const t2 = timeFmt.format(end);
//       return sameDay ? `${d} • ${t1}–${t2}` : `${d} ${t1} → ${dateFmt.format(end)} ${t2}`;
//     }
//     return `${d} • ${t1}`;
//   } catch {
//     return new Date(startISO).toLocaleString();
//   }
// }


import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { listLiveSessions, prettyPrice, type PublicLiveSession } from "@/lib/liveSessions.api";

/**
 * Home "Upcoming Live Sessions" — premium horizontal carousel
 * - Only upcoming (filters out anything in the past)
 * - Smooth arrows, fades, dots
 * - Responsive card widths with snap
 */
export default function UpcomingLiveSessions({ limit = 12 }: { limit?: number }) {
  const nowISO = new Date().toISOString();
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["homeUpcomingLive", { limit }],
    queryFn: () =>
      listLiveSessions({
        status: "scheduled",
        visibility: "public",
        from: nowISO, // harmless if server ignores; we still filter client-side
        page: 1,
        limit,
      }),
    staleTime: 30_000,
    keepPreviousData: true,
  });

  // Strictly upcoming on client
  const items = useMemo<PublicLiveSession[]>(() => {
    const now = Date.now();
    const src = data?.results || [];
    return src
      .filter(s => new Date(s.startAt).getTime() > now)
      .sort((a,b) => +new Date(a.startAt) - +new Date(b.startAt));
  }, [data]);

  return (
    <section className="container-app space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">Upcoming live sessions</h2>
          <p className="text-sm text-muted-foreground">Join interactive classes and Q&amp;A</p>
        </div>
        <Link to="/live" className="text-sm font-medium text-primary hover:underline">
          View all
        </Link>
      </div>

      {isLoading ? (
        <Carousel>
          {Array.from({ length: Math.min(limit, 8) }).map((_, i) => (
            <CardShell key={i}><CardSkeleton /></CardShell>
          ))}
        </Carousel>
      ) : isError ? (
        <div className="rounded-xl border bg-white p-6 text-sm">
          <p className="text-red-600">Couldn’t load live sessions.</p>
          <button onClick={() => refetch()} className="mt-2 inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50">
            Try again
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border bg-white p-6 text-sm text-muted-foreground">
          No upcoming sessions yet — check back soon.
        </div>
      ) : (
        <>
          <Carousel fetching={isFetching}>
            {items.map((s) => (
              <CardShell key={s.id}><LiveCard s={s} /></CardShell>
            ))}
          </Carousel>
          <Dots total={items.length} />
        </>
      )}
    </section>
  );
}

/* ---------- Carousel ---------- */

function Carousel({ children, fetching }: { children: React.ReactNode; fetching?: boolean }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const update = () => {
    const el = trackRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanLeft(scrollLeft > 2);
    setCanRight(scrollLeft + clientWidth < scrollWidth - 2);
  };

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    update();
    const onScroll = () => update();
    const onResize = () => update();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const nudge = (dir: "left" | "right") => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".card-shell");
    const step = card ? Math.max(card.offsetWidth + 16, el.clientWidth * 0.8) : el.clientWidth * 0.9;
    el.scrollBy({ left: dir === "left" ? -step : step, behavior: "smooth" });
  };

  return (
    <div className="relative">
      {/* edge fades */}
      <div className={`edge-fade left-0 bg-gradient-to-r from-white to-transparent ${canLeft ? "opacity-100" : "opacity-0"}`} />
      <div className={`edge-fade right-0 bg-gradient-to-l from-white to-transparent ${canRight ? "opacity-100" : "opacity-0"}`} />

      {/* arrows */}
      <button
        aria-label="Scroll left"
        className={`arrow-btn left-2 ${canLeft ? "" : "pointer-events-none opacity-0"}`}
        onClick={() => nudge("left")}
      >‹</button>
      <button
        aria-label="Scroll right"
        className={`arrow-btn right-2 ${canRight ? "" : "pointer-events-none opacity-0"}`}
        onClick={() => nudge("right")}
      >›</button>

      <div ref={trackRef} className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pr-2 no-scrollbar">
        {children}
        {fetching && <CardShell><CardSkeleton /></CardShell>}
      </div>
    </div>
  );
}

function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="card-shell">
      {children}
    </div>
  );
}

/* ---------- Fancy card ---------- */

function LiveCard({ s }: { s: PublicLiveSession }) {
  const when = formatDateRange(s.startAt, s.endAt, s.timezone);
  const price = prettyPrice(s.pricing);
  const isFree = (s.pricing?.type ?? "free") === "free";
  const { tLeft, label } = useCountdown(s.startAt, s.timezone);

  return (
    <article className="group overflow-hidden rounded-2xl ring-1 ring-black/5 bg-white transition hover:shadow-md">
      <div className="relative aspect-[16/9] bg-muted">
        <img
          src={s.thumbnail || "/images/course-placeholder.avif"}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition group-hover:scale-[1.02]"
        />
        {/* <div className="absolute left-2 top-2 flex flex-wrap items-center gap-2">
          <Chip>{when}</Chip>
          {s.capacity ? <Chip muted>Cap {s.capacity}</Chip> : <Chip muted>Unlimited</Chip>}
        </div> */}
        <div className="absolute right-2 bottom-2">
          <Chip kind={isFree ? "success" : "brand"}>{price}</Chip>
        </div>
      </div>

      <div className="p-4">
        <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug">{s.title}</h3>
        {s.description && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{s.description}</p>}

        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{label}: <strong className="text-foreground">{tLeft}</strong></span>
          <Link
            to={`/live/${encodeURIComponent(s.id)}`}
            className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
          >
            Details
          </Link>
        </div>
      </div>
    </article>
  );
}

/* ---------- Dots ---------- */
function Dots({ total }: { total: number }) {
  // simple visual hint; not interactive (keeps code light)
  const maxDots = 10;
  const n = Math.min(total, maxDots);
  return (
    <div className="mt-2 flex items-center justify-center gap-1.5">
      {Array.from({ length: n }).map((_, i) => (
        <span key={i} className="h-1.5 w-1.5 rounded-full bg-gray-300" />
      ))}
    </div>
  );
}

/* ---------- Tiny UI atoms ---------- */

function Chip({
  children,
  kind,
  muted,
}: {
  children: React.ReactNode;
  kind?: "brand" | "success";
  muted?: boolean;
}) {
  const base = "rounded-full px-2 py-0.5 text-[11px] font-medium ring-1";
  const cls =
    muted
      ? "bg-white/85 text-muted-foreground ring-black/10"
      : kind === "success"
      ? "bg-emerald-100 text-emerald-700 ring-emerald-200"
      : kind === "brand"
      ? "bg-primary/10 text-primary ring-primary/20"
      : "bg-white/90 text-foreground ring-black/10";
  return <span className={`${base} ${cls}`}>{children}</span>;
}

/* ---------- Skeleton ---------- */

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl ring-1 ring-black/5 bg-white">
      <div className="animate-pulse">
        <div className="h-[180px] bg-gray-200" />
        <div className="p-4 space-y-3">
          <div className="h-4 w-3/4 bg-gray-200 rounded" />
          <div className="h-3 w-5/6 bg-gray-200 rounded" />
          <div className="h-3 w-2/3 bg-gray-200 rounded" />
          <div className="h-7 w-24 bg-gray-200 rounded mt-2" />
        </div>
      </div>
    </div>
  );
}

/* ---------- Hooks & utils ---------- */

function useCountdown(startISO: string, tz?: string) {
  const start = new Date(startISO).getTime();
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, start - now);
  const s = Math.floor(diff / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  const parts = d > 0 ? [`${d}d`, `${h}h`] : [`${h}h`, `${m}m`];
  const tLeft = diff === 0 ? "Starting now" : `${parts.join(" ")} ${d === 0 ? `${ss}s` : ""}`.trim();
  return { tLeft, label: diff === 0 ? "Status" : "Starts in" };
}

function formatDateRange(startISO: string, endISO?: string, tz?: string) {
  const timeZone = tz || "Europe/London";
  try {
    const start = new Date(startISO);
    const end = endISO ? new Date(endISO) : undefined;
    const dateFmt = new Intl.DateTimeFormat(undefined, { timeZone, weekday: "short", day: "2-digit", month: "short" });
    const timeFmt = new Intl.DateTimeFormat(undefined, { timeZone, hour: "2-digit", minute: "2-digit", hour12: false });
    const d = dateFmt.format(start);
    const t1 = timeFmt.format(start);
    if (end) {
      const sameDay =
        start.toLocaleDateString("en-GB", { timeZone }) === end.toLocaleDateString("en-GB", { timeZone });
      const t2 = timeFmt.format(end);
      return sameDay ? `${d} • ${t1}–${t2}` : `${d} ${t1} → ${dateFmt.format(end)} ${t2}`;
    }
    return `${d} • ${t1}`;
  } catch {
    return new Date(startISO).toLocaleString();
  }
}
