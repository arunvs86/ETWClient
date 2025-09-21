// // src/components/home/UpcomingLiveSessions.tsx
// import { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
// import Button from '@/components/ui/Button';
// import { listLiveSessions, prettyPrice, type PublicLiveSession } from '@/lib/liveSessions.api';

// function fmtDate(d: string, tz = 'Europe/London', locale = 'en-GB') {
//   try {
//     const dt = new Date(d);
//     const day = new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: tz }).format(dt);
//     const date = new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'short', timeZone: tz }).format(dt);
//     const time = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: tz }).format(dt);
//     return `${day}, ${date} • ${time}`;
//   } catch {
//     return new Date(d).toLocaleString();
//   }
// }

// function PricePill({ s }: { s: PublicLiveSession }) {
//   if (s.membersAccess && s.membersAccess !== 'none') {
//     return (
//       <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[12px] font-medium text-indigo-700 ring-1 ring-indigo-200">
//         Included
//       </span>
//     );
//   }
//   if (s.pricing?.type === 'free') {
//     return (
//       <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[12px] font-medium text-emerald-700 ring-1 ring-emerald-200">
//         Free
//       </span>
//     );
//   }
//   return (
//     <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[12px] font-medium text-zinc-800 ring-1 ring-zinc-200">
//       {prettyPrice(s.pricing)}
//     </span>
//   );
// }

// function SpotsLeft({ capacity, enrolled }: { capacity?: number; enrolled?: number }) {
//   if (!capacity) return null;
//   const left = Math.max(0, capacity - (enrolled || 0));
//   return (
//     <span className="rounded-full bg-white/90 px-2 py-0.5 text-[11px] ring-1 ring-black/10">
//       {left} spots left
//     </span>
//   );
// }

// function LiveCard({ s }: { s: PublicLiveSession }) {
//   const href = `/live/${encodeURIComponent(s.id)}`;
//   const tz = s.timezone || 'Europe/London';
//   return (
//     <Link
//       to={href}
//       className="group block overflow-hidden rounded-xl ring-1 ring-black/5 bg-white transition hover:shadow-md"
//     >
//       <div className="relative aspect-[16/9] bg-muted">
//         <img
//           src={s.thumbnail || '/images/course-placeholder.avif'}
//           alt=""
//           loading="lazy"
//           decoding="async"
//           className="h-full w-full object-cover transition group-hover:scale-[1.02]"
//         />
//         <div className="absolute left-2 top-2 flex items-center gap-2">
//           <PricePill s={s} />
//           <SpotsLeft capacity={s.capacity} enrolled={(s as any).enrolledCount} />
//         </div>
//       </div>
//       <div className="p-4">
//         <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug">{s.title}</h3>
//         <p className="mt-1 text-xs text-muted-foreground">
//           {fmtDate(s.startAt, tz)} {s.timezone ? `(${s.timezone})` : ''}
//         </p>
//       </div>
//     </Link>
//   );
// }

// function SkeletonCard() {
//   return (
//     <div className="animate-pulse overflow-hidden rounded-xl ring-1 ring-black/5 bg-white">
//       <div className="aspect-[16/9] bg-gray-200" />
//       <div className="p-4 space-y-2">
//         <div className="h-4 w-3/5 bg-gray-200 rounded" />
//         <div className="h-3 w-1/2 bg-gray-200 rounded" />
//       </div>
//     </div>
//   );
// }

// export default function UpcomingLiveSessions({ limit = 6 }: { limit?: number }) {
//   const [items, setItems] = useState<PublicLiveSession[] | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [err, setErr] = useState('');

//   useEffect(() => {
//     let on = true;
//     setLoading(true);
//     setErr('');
//     // Your API accepts { status, page, limit, visibility }
//     listLiveSessions({ status: 'scheduled', visibility: 'public', page: 1, limit })
//       .then((res) => { if (on) setItems(res.results || []); })
//       .catch((e) => { if (on) setErr(e?.response?.data?.error || e?.message || 'Failed to load live sessions'); })
//       .finally(() => { if (on) setLoading(false); });
//     return () => { on = false; };
//   }, [limit]);

//   return (
//     <section className="container-app space-y-6">
//       <div className="flex items-end justify-between">
//         <div>
//           <h2 className="text-2xl md:text-3xl font-bold">Upcoming live sessions</h2>
//           <p className="text-sm text-muted-foreground">Join our next interactive events.</p>
//         </div>
//         <Link to="/live" className="text-sm font-medium text-primary hover:underline">View all</Link>
//       </div>

//       {err && !loading && (
//         <div className="rounded-xl border p-4 text-sm text-amber-700 bg-amber-50">{err}</div>
//       )}

//       {loading ? (
//         <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
//           {Array.from({ length: limit }).map((_, i) => <SkeletonCard key={i} />)}
//         </div>
//       ) : items && items.length ? (
//         <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
//           {items.map(s => <LiveCard key={s.id} s={s} />)}
//         </div>
//       ) : (
//         <div className="rounded-2xl bg-gradient-to-r from-primary/10 to-transparent p-6 md:p-8 text-center">
//           <h3 className="text-xl font-semibold">No upcoming live sessions yet</h3>
//           <p className="mt-1 text-sm text-muted-foreground">Check back soon, or explore our on-demand courses.</p>
//           <div className="mt-4">
//             <Link to="/courses"><Button>Explore Courses</Button></Link>
//           </div>
//         </div>
//       )}
//     </section>
//   );
// }


// src/components/home/UpcomingLiveSessions.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '@/components/ui/Button';
import { listLiveSessions, prettyPrice, type PublicLiveSession } from '@/lib/liveSessions.api';

function fmtDate(d: string, tz = 'Europe/London', locale = 'en-GB') {
  try {
    const dt = new Date(d);
    const day = new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: tz }).format(dt);
    const date = new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'short', timeZone: tz }).format(dt);
    const time = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: tz }).format(dt);
    return `${day}, ${date} • ${time}`;
  } catch {
    return new Date(d).toLocaleString();
  }
}

function PricePill({ s }: { s: PublicLiveSession }) {
  if (s.membersAccess && s.membersAccess !== 'none') {
    return (
      <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[12px] font-medium text-indigo-700 ring-1 ring-indigo-200">
        Included
      </span>
    );
  }
  if (s.pricing?.type === 'free') {
    return (
      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[12px] font-medium text-emerald-700 ring-1 ring-emerald-200">
        Free
      </span>
    );
  }
  return (
    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[12px] font-medium text-zinc-800 ring-1 ring-zinc-200">
      {prettyPrice(s.pricing)}
    </span>
  );
}

function SpotsLeft({ capacity, enrolled }: { capacity?: number; enrolled?: number }) {
  if (!capacity) return null;
  const left = Math.max(0, capacity - (enrolled || 0));
  return (
    <span className="rounded-full bg-white/90 px-2 py-0.5 text-[11px] ring-1 ring-black/10">
      {left} spots left
    </span>
  );
}

function LiveCard({ s }: { s: PublicLiveSession }) {
  const href = `/live/${encodeURIComponent(s.id)}`;
  const tz = s.timezone || 'Europe/London';
  return (
    <Link
      to={href}
      className="group block overflow-hidden rounded-xl ring-1 ring-black/5 bg-white transition hover:shadow-md"
    >
      <div className="relative aspect-[16/9] bg-muted">
        <img
          src={s.thumbnail || '/images/course-placeholder.avif'}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition group-hover:scale-[1.02]"
        />
        <div className="absolute left-2 top-2 flex items-center gap-2">
          <PricePill s={s} />
          <SpotsLeft capacity={s.capacity} enrolled={(s as any).enrolledCount} />
        </div>
      </div>
      <div className="p-4">
        <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug">{s.title}</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {fmtDate(s.startAt, tz)} {s.timezone ? `(${s.timezone})` : ''}
        </p>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl ring-1 ring-black/5 bg-white">
      <div className="aspect-[16/9] bg-gray-200" />
      <div className="p-4 space-y-2">
        <div className="h-4 w-3/5 bg-gray-200 rounded" />
        <div className="h-3 w-1/2 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

export default function UpcomingLiveSessions({ limit = 6 }: { limit?: number }) {
  const [items, setItems] = useState<PublicLiveSession[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    let on = true;
    setLoading(true);
    setErr('');

    // only fetch future sessions (1-min buffer to include sessions starting "now")
    const fromIso = new Date(Date.now() - 60_000).toISOString();

    listLiveSessions({ status: 'scheduled', visibility: 'public', page: 1, limit, from: fromIso })
      .then((res) => { if (on) setItems(res.results || []); })
      .catch((e) => { if (on) setErr(e?.response?.data?.error || e?.message || 'Failed to load live sessions'); })
      .finally(() => { if (on) setLoading(false); });

    return () => { on = false; };
  }, [limit]);

  // client-side safety filter
  const futureItems = (items || []).filter(s => {
    const start = new Date(s.startAt).getTime();
    return start >= Date.now() - 60_000; // 1-min grace
  });

  return (
    <section className="container-app space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">Upcoming live sessions</h2>
          <p className="text-sm text-muted-foreground">Join our next interactive events.</p>
        </div>
        <Link to="/live" className="text-sm font-medium text-primary hover:underline">View all</Link>
      </div>

      {err && !loading && (
        <div className="rounded-xl border p-4 text-sm text-amber-700 bg-amber-50">{err}</div>
      )}

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: limit }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : futureItems.length ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {futureItems.map(s => <LiveCard key={s.id} s={s} />)}
        </div>
      ) : (
        <div className="rounded-2xl bg-gradient-to-r from-primary/10 to-transparent p-6 md:p-8 text-center">
          <h3 className="text-xl font-semibold">No upcoming live sessions yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Check back soon, or explore our on-demand courses.</p>
          <div className="mt-4">
            <Link to="/live"><Button>Explore Courses</Button></Link>
          </div>
        </div>
      )}
    </section>
  );
}
