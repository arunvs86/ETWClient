// import { useMemo } from 'react';
// import { Link } from 'react-router-dom';
// import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
// import { listPlans, getMyMembership, checkoutMembership, cancelMembership, type Membership } from '@/lib/membership.api';
// import { useAuth } from '@/context/AuthProvider';

// /* Lightweight inline icons (no external deps) */
// function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
//   return (
//     <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
//       <path fill="currentColor" d="M9.55 17.6a1 1 0 0 1-.7-.3l-4.2-4.2a1 1 0 1 1 1.4-1.4l3.5 3.5 8.3-8.3a1 1 0 0 1 1.4 1.4l-9 9a1 1 0 0 1-.7.3Z"/>
//     </svg>
//   );
// }
// function ShieldIcon(props: React.SVGProps<SVGSVGElement>) {
//   return (
//     <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
//       <path fill="currentColor" d="M12 2l8 3v6c0 4.97-3.05 9.58-8 11-4.95-1.42-8-6.03-8-11V5l8-3Z"/>
//     </svg>
//   );
// }
// function ZapIcon(props: React.SVGProps<SVGSVGElement>) {
//   return (
//     <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
//       <path fill="currentColor" d="M13 2 3 14h7v8l11-14h-8l0-6Z"/>
//     </svg>
//   );
// }
// function LockIcon(props: React.SVGProps<SVGSVGElement>) {
//   return (
//     <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
//       <path fill="currentColor" d="M12 1a5 5 0 0 1 5 5v3h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h1V6a5 5 0 0 1 5-5Zm3 8V6a3 3 0 0 0-6 0v3h6Z"/>
//     </svg>
//   );
// }

// function Badge({ children, tone = 'gray' }: { children: React.ReactNode; tone?: 'gray'|'green'|'amber'|'red' }) {
//   const toneMap = {
//     gray: 'bg-gray-100 text-gray-700 border-gray-200',
//     green: 'bg-green-100 text-green-800 border-green-200',
//     amber: 'bg-amber-100 text-amber-800 border-amber-200',
//     red: 'bg-red-100 text-red-800 border-red-200',
//   } as const;
//   return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs ${toneMap[tone]}`}>{children}</span>;
// }

// function StatusBadge({ status }: { status: Membership['status'] }) {
//   const tone = status === 'active' || status === 'trialing' ? 'green'
//     : status === 'past_due' ? 'amber'
//     : status === 'canceled' ? 'gray'
//     : 'red';
//   return <Badge tone={tone}>{status}</Badge>;
// }

// function formatDate(d?: string) {
//   if (!d) return '';
//   try { return new Date(d).toLocaleDateString(); } catch { return d; }
// }

// export default function PlansPage() {
//   const { user, loading } = useAuth();
//   const qc = useQueryClient();

//   const qPlans = useQuery({ queryKey: ['plans'], queryFn: listPlans, staleTime: 60_000 });
//   const isAuthed = !!user;
//   const qMembership = useQuery({
//     queryKey: ['me', 'membership'],
//     queryFn: getMyMembership,
//     staleTime: 5_000,
//     enabled: isAuthed,         
//     retry: false,             
//   });

//   const mCheckout = useMutation({
//     mutationFn: (input: { planId?: string; priceId?: string }) => checkoutMembership(input),
//     onSuccess: (data) => { if (data?.checkoutUrl) window.location.href = data.checkoutUrl; },
//   });

//   const mCancel = useMutation({
//     mutationFn: () => cancelMembership(),
//     onSuccess: async () => { await qc.invalidateQueries({ queryKey: ['me', 'membership'] }); },
//   });

//   const plans = qPlans.data || [];
//   const mem = qMembership.data;
//   const notLogged = !user && !loading;

//   const planCards = useMemo(() => {
//     return (plans || []).map(p => ({ ...p, title: 'Lifetime', interval: 'one-time' }));
//   }, [plans]);

//   /* ---------- Loading ---------- */
//   if (qPlans.isLoading || qMembership.isLoading) {
//     return (
//       <div className="mx-auto max-w-7xl p-6 space-y-8">
//         <div className="h-40 rounded-3xl bg-gradient-to-r from-indigo-50 to-purple-50 animate-pulse" />
//         <div className="grid gap-6 md:grid-cols-2">
//           <div className="rounded-3xl border p-6">
//             <div className="h-7 w-1/3 bg-gray-100 rounded animate-pulse" />
//             <div className="mt-4 h-10 w-1/2 bg-gray-100 rounded animate-pulse" />
//             <div className="mt-6 h-11 w-full bg-gray-100 rounded animate-pulse" />
//           </div>
//           <div className="rounded-3xl border p-6">
//             <div className="h-7 w-1/2 bg-gray-100 rounded animate-pulse" />
//             <div className="mt-4 h-28 w-full bg-gray-100 rounded animate-pulse" />
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (qPlans.isError) {
//     return (
//       <div className="mx-auto max-w-3xl p-6">
//         <div className="rounded-lg border p-6 text-red-600">Failed to load plans.</div>
//       </div>
//     );
//   }

//   /* ---------- Page ---------- */
//   return (
//     <div className="mx-auto max-w-7xl p-4 sm:p-6 space-y-14">
//       {/* HERO */}
//       <section className="relative overflow-hidden rounded-3xl ring-1 ring-black/5">
//         <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_100%_0%,rgba(79,70,229,0.15),transparent),radial-gradient(80%_60%_at_0%_100%,rgba(147,51,234,0.15),transparent)]" />
//         <div className="relative px-6 py-12 md:px-12 md:py-16 text-center">
//           <p className="text-[11px] tracking-[0.2em] text-indigo-600 uppercase">Membership</p>
//           <h1 className="mt-2 text-3xl md:text-5xl font-semibold leading-tight">
//             Join once. <span className="text-indigo-600">Learn forever.</span>
//           </h1>
//           <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
//             Lifetime access to all past videos, eBooks, mock tests, and member-only support — with a single £50 payment.
//           </p>
//           <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-gray-500">
//             <span className="inline-flex items-center gap-1"><ShieldIcon className="h-4 w-4" /> Secure Stripe checkout</span>
//             <span>•</span>
//             <span className="inline-flex items-center gap-1"><ZapIcon className="h-4 w-4" /> Instant activation</span>
//             <span>•</span>
//             <span className="inline-flex items-center gap-1"><LockIcon className="h-4 w-4" /> No subscriptions</span>
//           </div>
//         </div>
//       </section>

//       {/* STATUS */}
//       <section className="flex flex-wrap items-center gap-3">
//         <h2 className="text-base font-semibold">Your membership</h2>
//         {mem ? (
//           <>
//             <Badge>plan: {mem.plan}</Badge>
//             <StatusBadge status={mem.status} />
//             {mem.cancelAtPeriodEnd && <Badge tone="amber">cancels end of period</Badge>}
//             <span className="text-xs text-gray-500">
//               {mem.status !== 'canceled' && <>period {formatDate(mem.currentPeriodStart)} → {formatDate(mem.currentPeriodEnd)}</>}
//             </span>
//           </>
//         ) : (
//           <Badge>no active membership</Badge>
//         )}
//       </section>

//       {/* PRICING + FEATURE LIST (two-column on md+) */}
//       <section className="grid gap-8 md:grid-cols-[1.1fr,1fr] md:items-start">
//         {/* Pricing Card */}
//         <div className="rounded-3xl border shadow-sm bg-white p-6 md:p-10">
//           <div className="flex items-center justify-between">
//             <div className="text-2xl font-semibold">Lifetime</div>
//             <Badge>one-time</Badge>
//           </div>

//           <div className="mt-4 flex items-baseline gap-2">
//             <div className="text-5xl font-bold tracking-tight">£50</div>
//             <div className="text-gray-500">one payment</div>
//           </div>

//           <p className="mt-3 text-sm text-gray-600">
//             Keep access forever. No renewals. Ideal for focused prep without recurring fees.
//           </p>

//           {/* CTA */}
//           <div className="mt-6">
//             {(!user && !loading) ? (
//               <Link
//                 to={`/login?next=${encodeURIComponent('/billing/plans')}`}
//                 className="inline-flex h-11 w-full items-center justify-center rounded-xl border px-4 text-sm hover:bg-gray-50"
//               >
//                 Log in to buy
//               </Link>
//             ) : mem && mem.status === 'active' && mem.plan === 'lifetime' ? (
//               <Link
//                 to="/me/enrollments"
//                 className="inline-flex h-11 w-full items-center justify-center rounded-xl border px-4 text-sm hover:bg-gray-50"
//               >
//                 You own Lifetime — Go to My Learning
//               </Link>
//             ) : (
//               <button
//                 onClick={() => mCheckout.mutate({ planId: 'lifetime' })}
//                 disabled={mCheckout.isPending}
//                 className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary px-4 text-white hover:opacity-95 disabled:opacity-60"
//               >
//                 {mCheckout.isPending ? 'Redirecting…' : 'Buy Lifetime Access'}
//               </button>
//             )}
//             <p className="mt-2 text-center text-xs text-gray-500">No hidden fees • VAT included where applicable</p>
//           </div>

//           {/* What you get */}
//           <div className="mt-8">
//             <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">What’s included</h3>
//             <ul className="mt-4 grid gap-3 sm:grid-cols-2">
//               {[
//                 'All past videos',
//                 'Support replies within 72 hours',
//                 'eBook: UCAT Sample Questions',
//                 'eBook: MMI Practice Questions',
//               ].map((t) => (
//                 <li key={t} className="flex items-start gap-3">
//                   <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
//                     <CheckIcon className="h-3.5 w-3.5" />
//                   </span>
//                   <span className="text-sm text-gray-700">{t}</span>
//                 </li>
//               ))}
//             </ul>
//           </div>

//           {/* Trust mini-cards (responsive) */}
//           <div className="mt-8 grid gap-3 sm:grid-cols-3">
//             {[
//               { title: 'No recurring fees', sub: 'One-time payment' },
//               { title: 'Instant access', sub: 'Active after payment' },
//               { title: 'Secure checkout', sub: 'Powered by Stripe' },
//             ].map((b) => (
//               <div key={b.title} className="rounded-xl border p-3 text-center">
//                 <div className="text-sm font-medium">{b.title}</div>
//                 <div className="text-xs text-gray-500">{b.sub}</div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Right column: Why / Perfect for / Steps */}
//         <div className="space-y-6">
//           <div className="rounded-3xl bg-gray-50 ring-1 ring-black/5 p-6 md:p-8">
//             <h3 className="text-lg font-semibold">Why Lifetime vs Free?</h3>
//             <div className="mt-4 grid gap-3">
//               <div className="text-sm">
//                 <span className="font-medium">Lifetime:</span> Full library, premium materials, member discounts & priority help.
//               </div>
//               <div className="text-sm">
//                 <span className="font-medium">Free:</span> Limited samples and public sessions only.
//               </div>
//             </div>

//             <div className="mt-6 rounded-xl border bg-white p-4 text-xs text-gray-600">
//               <div className="font-medium text-gray-800">Perfect for:</div>
//               <ul className="mt-2 list-disc pl-5 space-y-1">
//                 <li>Students preparing for UCAT/MMI</li>
//                 <li>Anyone who prefers a one-time payment</li>
//                 <li>Learners who want ongoing access with no surprises</li>
//               </ul>
//             </div>
//           </div>

//           <div className="rounded-3xl border p-6 md:p-8">
//             <h3 className="text-lg font-semibold">How it works</h3>
//             <ol className="mt-4 grid gap-3 text-sm text-gray-700">
//               <li><span className="font-medium">1.</span> Click “Buy Lifetime Access”.</li>
//               <li><span className="font-medium">2.</span> Complete secure Stripe checkout (test cards ok in dev).</li>
//               <li><span className="font-medium">3.</span> We auto-activate via webhook. You get instant access.</li>
//             </ol>
//           </div>
//         </div>
//       </section>

//       {/* FAQ */}
//       <section className="rounded-3xl border p-6 md:p-8">
//         <h3 className="text-lg font-semibold">FAQs</h3>
//         <div className="mt-2 divide-y text-sm">
//           <details className="group py-3">
//             <summary className="flex cursor-pointer list-none items-center justify-between">
//               <span className="font-medium text-gray-800">Is this a subscription?</span>
//               <span className="text-gray-400 group-open:rotate-180 transition">⌄</span>
//             </summary>
//             <p className="mt-2 text-gray-600">No. It’s a single £50 payment for lifetime access.</p>
//           </details>

//           <details className="group py-3">
//             <summary className="flex cursor-pointer list-none items-center justify-between">
//               <span className="font-medium text-gray-800">When do I get access?</span>
//               <span className="text-gray-4 00 group-open:rotate-180 transition">⌄</span>
//             </summary>
//             <p className="mt-2 text-gray-600">Immediately after payment. Your account is activated automatically.</p>
//           </details>

//           <details className="group py-3">
//             <summary className="flex cursor-pointer list-none items-center justify-between">
//               <span className="font-medium text-gray-800">Do I get help if I’m stuck?</span>
//               <span className="text-gray-400 group-open:rotate-180 transition">⌄</span>
//             </summary>
//             <p className="mt-2 text-gray-600">Yes — members receive replies within 72 hours.</p>
//           </details>
//         </div>
//       </section>

//       {/* CTA STRIP */}
//       <section className="rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-10 md:px-10 md:py-12 text-center">
//         <h3 className="text-2xl md:text-3xl font-semibold">Ready to start?</h3>
//         <p className="mt-2 text-white/90 max-w-2xl mx-auto">
//           Lifetime access to courses, eBooks, mock tests, and member-only support. No renewals. No surprises.
//         </p>

//         <div className="mt-6">
//           {(!user && !loading) ? (
//             <Link
//               to={`/login?next=${encodeURIComponent('/billing/plans')}`}
//               className="inline-flex h-11 items-center justify-center rounded-xl bg-white/10 px-6 text-white ring-1 ring-white/30 hover:bg-white/20"
//             >
//               Log in to buy Lifetime
//             </Link>
//           ) : mem && mem.status === 'active' && mem.plan === 'lifetime' ? (
//             <Link
//               to="/me/enrollments"
//               className="inline-flex h-11 items-center justify-center rounded-xl bg-white px-6 text-indigo-700 hover:bg-white/90"
//             >
//               Go to My Learning
//             </Link>
//           ) : (
//             <button
//               onClick={() => mCheckout.mutate({ planId: 'lifetime' })}
//               disabled={mCheckout.isPending}
//               className="inline-flex h-11 items-center justify-center rounded-xl bg-white px-6 text-indigo-700 hover:bg-white/90 disabled:opacity-60"
//             >
//               {mCheckout.isPending ? 'Redirecting…' : 'Buy Lifetime for £50'}
//             </button>
//           )}
//         </div>
//       </section>

//       <p className="text-center text-xs text-gray-500">Payments are processed by Stripe. You may be redirected to complete checkout.</p>
//     </div>
//   );
// }


import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listPlans, getMyMembership, checkoutMembership, cancelMembership, type Membership } from '@/lib/membership.api';
import { useAuth } from '@/context/AuthProvider';

/* Icons & UI bits (unchanged) */
function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M9.55 17.6a1 1 0 0 1-.7-.3l-4.2-4.2a1 1 0 1 1 1.4-1.4l3.5 3.5 8.3-8.3a1 1 0 0 1 1.4 1.4l-9 9a1 1 0 0 1-.7.3Z"/>
    </svg>
  );
}
function ShieldIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M12 2l8 3v6c0 4.97-3.05 9.58-8 11-4.95-1.42-8-6.03-8-11V5l8-3Z"/>
    </svg>
  );
}
function ZapIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M13 2 3 14h7v8l11-14h-8l0-6Z"/>
    </svg>
  );
}
function LockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M12 1a5 5 0 0 1 5 5v3h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h1V6a3 3 0 0 0-6 0v3h6Z"/>
    </svg>
  );
}
function Badge({ children, tone = 'gray' }: { children: React.ReactNode; tone?: 'gray'|'green'|'amber'|'red' }) {
  const toneMap = {
    gray: 'bg-gray-100 text-gray-700 border-gray-200',
    green: 'bg-green-100 text-green-800 border-green-200',
    amber: 'bg-amber-100 text-amber-800 border-amber-200',
    red: 'bg-red-100 text-red-800 border-red-200',
  } as const;
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs ${toneMap[tone]}`}>{children}</span>;
}
function StatusBadge({ status }: { status: Membership['status'] }) {
  const tone = status === 'active' || status === 'trialing' ? 'green'
    : status === 'past_due' ? 'amber'
    : status === 'canceled' ? 'gray'
    : 'red';
  return <Badge tone={tone}>{status}</Badge>;
}
function formatDate(d?: string) {
  if (!d) return '';
  try { return new Date(d).toLocaleDateString(); } catch { return d; }
}
function money(minor?: number, currency = 'GBP') {
  if (!minor && minor !== 0) return '';
  return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format((minor || 0) / 100);
}

export default function PlansPage() {
  const { user, loading } = useAuth();
  const qc = useQueryClient();

  const qPlans = useQuery({ queryKey: ['plans'], queryFn: listPlans, staleTime: 60_000 });
  const isAuthed = !!user;
  const qMembership = useQuery({
    queryKey: ['me', 'membership'],
    queryFn: getMyMembership,
    staleTime: 5_000,
    enabled: isAuthed,
    retry: false,
  });

  const mCheckout = useMutation({
    mutationFn: (input: { planId: 'yearly' | 'lifetime' }) => checkoutMembership(input),
    onSuccess: (data) => { if (data?.checkoutUrl) window.location.href = data.checkoutUrl; },
  });

  const mCancel = useMutation({
    mutationFn: () => cancelMembership(),
    onSuccess: async () => { await qc.invalidateQueries({ queryKey: ['me', 'membership'] }); },
  });

  // NOTE: If your client unwraps .plans server-side, this will already be the array.
  // If not, adjust to: const plans = qPlans.data?.plans || [];
  // const plans = (qPlans.data?.plans) ?? (qPlans.data ?? []);
  const plans = qPlans.data || [];

  const mem = qMembership.data || null; // because the helper returns the object

  const yearly = plans.find((p: any) => p.id === 'yearly');
  const lifetime = plans.find((p: any) => p.id === 'lifetime');

  const notLogged = !user && !loading;

  /* ---------- Loading ---------- */
  if (qPlans.isLoading || qMembership.isLoading) {
    return (
      <div className="mx-auto max-w-7xl p-6 space-y-8">
        <div className="h-40 rounded-3xl bg-gradient-to-r from-indigo-50 to-purple-50 animate-pulse" />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border p-6">
            <div className="h-7 w-1/3 bg-gray-100 rounded animate-pulse" />
            <div className="mt-4 h-10 w-1/2 bg-gray-100 rounded animate-pulse" />
            <div className="mt-6 h-11 w-full bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="rounded-3xl border p-6">
            <div className="h-7 w-1/2 bg-gray-100 rounded animate-pulse" />
            <div className="mt-4 h-28 w-full bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (qPlans.isError) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="rounded-lg border p-6 text-red-600">Failed to load plans.</div>
      </div>
    );
  }

  const alreadyLifetime = mem && mem.status === 'active' && mem.plan === 'lifetime';
  const alreadyYearly = mem && mem.status === 'active' && mem.plan === 'yearly';

  function CTA({ planId }: { planId: 'yearly' | 'lifetime' }) {
    if (notLogged) {
      return (
        <Link
          to={`/login?next=${encodeURIComponent('/billing/plans')}`}
          className="inline-flex h-11 w-full items-center justify-center rounded-xl border px-4 text-sm hover:bg-gray-50"
        >
          Log in to buy
        </Link>
      );
    }
    if (alreadyLifetime) {
      return (
        <Link
          to="/me/enrollments"
          className="inline-flex h-11 w-full items-center justify-center rounded-xl border px-4 text-sm hover:bg-gray-50"
        >
          You own Lifetime — Go to My Learning
        </Link>
      );
    }
    if (planId === 'yearly' && alreadyYearly) {
      return (
        <button
          onClick={() => mCheckout.mutate({ planId: 'yearly' })}
          disabled={mCheckout.isPending}
          className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary px-4 text-white hover:opacity-95 disabled:opacity-60"
        >
          {mCheckout.isPending ? 'Redirecting…' : `Renew for ${money(yearly?.priceMinor, yearly?.currency)}`}
        </button>
      );
    }
    return (
      <button
        onClick={() => mCheckout.mutate({ planId })}
        disabled={mCheckout.isPending}
        className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary px-4 text-white hover:opacity-95 disabled:opacity-60"
      >
        {mCheckout.isPending ? 'Redirecting…' :
          planId === 'yearly'
            ? `Buy 1-Year for ${money(yearly?.priceMinor, yearly?.currency)}`
            : `Buy Lifetime for ${money(lifetime?.priceMinor, lifetime?.currency)}`
        }
      </button>
    );
  }

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 space-y-14">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl ring-1 ring-black/5">
        <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_100%_0%,rgba(79,70,229,0.15),transparent),radial-gradient(80%_60%_at_0%_100%,rgba(147,51,234,0.15),transparent)]" />
        <div className="relative px-6 py-12 md:px-12 md:py-16 text-center">
          <p className="text-[11px] tracking-[0.2em] text-indigo-600 uppercase">Membership</p>
          <h1 className="mt-2 text-3xl md:text-5xl font-semibold leading-tight">
            Pick what fits: <span className="text-indigo-600">1-Year</span> or <span className="text-indigo-600">Lifetime</span>.
          </h1>
          <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
            Full library access, eBooks, mock tests, and member support. Choose 12-month access or pay once for lifetime.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1"><ShieldIcon className="h-4 w-4" /> Secure Stripe checkout</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1"><ZapIcon className="h-4 w-4" /> Instant activation</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1"><LockIcon className="h-4 w-4" /> No subscriptions</span>
          </div>
        </div>
      </section>

      {/* STATUS */}
      <section className="flex flex-wrap items-center gap-3">
        <h2 className="text-base font-semibold">Your membership</h2>
        {mem ? (
          <>
            <Badge>plan: {mem.plan}</Badge>
            <StatusBadge status={mem.status} />
            {mem.cancelAtPeriodEnd && <Badge tone="amber">cancels end of period</Badge>}
            <span className="text-xs text-gray-500">
              {mem.status !== 'canceled' && <>period {formatDate(mem.currentPeriodStart)} → {formatDate(mem.currentPeriodEnd)}</>}
            </span>
          </>
        ) : (
          <Badge>no active membership</Badge>
        )}
      </section>

      {/* PRICING GRID */}
      <section className="grid gap-8 md:grid-cols-2">
        {/* Yearly */}
        <div className="rounded-3xl border shadow-sm bg-white p-6 md:p-10">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-semibold">1-Year</div>
            <Badge>{yearly?.badge || '12 months access'}</Badge>
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <div className="text-5xl font-bold tracking-tight">
              {money(yearly?.priceMinor, yearly?.currency) || '£75'}
            </div>
            <div className="text-gray-500">one-time</div>
          </div>

          <p className="mt-3 text-sm text-gray-600">12 months full access. Renew anytime (no auto-billing).</p>

          <div className="mt-6">
            <CTA planId="yearly" />
            <p className="mt-2 text-center text-xs text-gray-500">VAT included where applicable</p>
          </div>

          <div className="mt-8">
            <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">What’s included</h3>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {['All past videos', 'Member support (≤72h)', 'UCAT Sample eBook', 'MMI Practice eBook'].map(t => (
                <li key={t} className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
                    <CheckIcon className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-sm text-gray-700">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Lifetime */}
        <div className="rounded-3xl border shadow-sm bg-white p-6 md:p-10">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-semibold">Lifetime</div>
            <Badge>{lifetime?.badge || 'Pay once, own forever'}</Badge>
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <div className="text-5xl font-bold tracking-tight">
              {money(lifetime?.priceMinor, lifetime?.currency) || '£100'}
            </div>
            <div className="text-gray-500">one-time</div>
          </div>

          <p className="mt-3 text-sm text-gray-600">Keep access forever. No renewals, no recurring fees.</p>

          <div className="mt-6">
            <CTA planId="lifetime" />
            <p className="mt-2 text-center text-xs text-gray-500">VAT included where applicable</p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              { title: 'No recurring fees', sub: 'One-time payment' },
              { title: 'Instant access', sub: 'Active after payment' },
              { title: 'Secure checkout', sub: 'Powered by Stripe' },
            ].map((b) => (
              <div key={b.title} className="rounded-xl border p-3 text-center">
                <div className="text-sm font-medium">{b.title}</div>
                <div className="text-xs text-gray-500">{b.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="rounded-3xl border p-6 md:p-8">
        <h3 className="text-lg font-semibold">FAQs</h3>
        <div className="mt-2 divide-y text-sm">
          <details className="group py-3">
            <summary className="flex cursor-pointer list-none items-center justify-between">
              <span className="font-medium text-gray-800">Is this a subscription?</span>
              <span className="text-gray-400 group-open:rotate-180 transition">⌄</span>
            </summary>
            <p className="mt-2 text-gray-600">No — both plans are one-time payments. 1-Year gives 12 months; Lifetime never expires.</p>
          </details>

          <details className="group py-3">
            <summary className="flex cursor-pointer list-none items-center justify-between">
              <span className="font-medium text-gray-800">When do I get access?</span>
              <span className="text-gray-400 group-open:rotate-180 transition">⌄</span>
            </summary>
            <p className="mt-2 text-gray-600">Immediately after payment. Activation is automatic.</p>
          </details>

          <details className="group py-3">
            <summary className="flex cursor-pointer list-none items-center justify-between">
              <span className="font-medium text-gray-800">How do I renew 1-Year?</span>
              <span className="text-gray-400 group-open:rotate-180 transition">⌄</span>
            </summary>
            <p className="mt-2 text-gray-600">Buy 1-Year again anytime. We extend from your current expiry (or from today if already expired).</p>
          </details>
        </div>
      </section>

      {/* CTA STRIP */}
      <section className="rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-10 md:px-10 md:py-12 text-center">
        <h3 className="text-2xl md:text-3xl font-semibold">Ready to start?</h3>
        <p className="mt-2 text-white/90 max-w-2xl mx-auto">
          Choose 1-Year for flexibility or Lifetime for peace of mind. Instant activation after checkout.
        </p>

        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          {notLogged ? (
            <>
              <Link
                to={`/login?next=${encodeURIComponent('/billing/plans')}`}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-white/10 px-6 text-white ring-1 ring-white/30 hover:bg-white/20"
              >
                Log in to buy 1-Year
              </Link>
              <Link
                to={`/login?next=${encodeURIComponent('/billing/plans')}`}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-white px-6 text-indigo-700 hover:bg-white/90"
              >
                Log in to buy Lifetime
              </Link>
            </>
          ) : alreadyLifetime ? (
            <Link
              to="/me/enrollments"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-white px-6 text-indigo-700 hover:bg-white/90"
            >
              Go to My Learning
            </Link>
          ) : (
            <>
              <button
                onClick={() => mCheckout.mutate({ planId: 'yearly' })}
                disabled={mCheckout.isPending}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-white/10 px-6 text-white ring-1 ring-white/30 hover:bg-white/20 disabled:opacity-60"
              >
                {mCheckout.isPending ? 'Redirecting…' : `Buy 1-Year (${money(yearly?.priceMinor, yearly?.currency) || '£75'})`}
              </button>
              <button
                onClick={() => mCheckout.mutate({ planId: 'lifetime' })}
                disabled={mCheckout.isPending}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-white px-6 text-indigo-700 hover:bg-white/90 disabled:opacity-60"
              >
                {mCheckout.isPending ? 'Redirecting…' : `Buy Lifetime (${money(lifetime?.priceMinor, lifetime?.currency) || '£100'})`}
              </button>
            </>
          )}
        </div>
      </section>

      <p className="text-center text-xs text-gray-500">Payments are processed by Stripe. You may be redirected to complete checkout.</p>
    </div>
  );
}
