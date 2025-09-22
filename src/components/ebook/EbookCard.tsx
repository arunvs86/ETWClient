// import { Link } from 'react-router-dom'
// import type { PublicEbook } from '@/lib/ebooks.api'

// export default function EbookCard({ e }: { e: PublicEbook }) {
//   return (
//     <Link to={`/ebooks/${e.slug}`} className="card group overflow-hidden">
//       <div className="aspect-video w-full overflow-hidden rounded-md bg-gray-100">
//         {e.thumbnail ? (
//           <img
//             src={e.thumbnail}
//             alt={e.title}
//             className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
//           />
//         ) : null}
//       </div>
//       <div className="mt-3">
//         <div className="line-clamp-2 font-medium">{e.title}</div>
//         {e.category ? <div className="mt-0.5 text-xs text-gray-600">{e.category}</div> : null}
//       </div>
//     </Link>
//   )
// }


import { Link } from 'react-router-dom';
import { BookOpen, Tag } from 'lucide-react';
import type { PublicEbook } from '@/lib/ebooks.api';

type Props = { e: PublicEbook; compact?: boolean };

export default function EbookCard({ e, compact = false }: Props) {
  const priceInfo = getPriceInfo(e); // { label: string; isFree: boolean } | null

  return (
    <Link
      to={`/ebooks/${e.slug}`}
      className="group block overflow-hidden rounded-2xl ring-1 ring-black/5 bg-white transition hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      {/* Cover */}
      <div className={`relative ${compact ? 'aspect-[4/3]' : 'aspect-video'} w-full bg-gray-100`}>
        {e.thumbnail ? (
          <img
            src={e.thumbnail}
            alt={e.title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-400">
            <BookOpen className="h-8 w-8" aria-hidden />
          </div>
        )}

        {/* Top-left chips */}
        <div className="pointer-events-none absolute left-2 top-2 flex flex-wrap gap-1.5">
          {e.category && <Chip>{e.category}</Chip>}
          {priceInfo &&
            (priceInfo.isFree ? (
              <Chip kind="success">Free</Chip>
            ) : (
              <Chip kind="brand">{priceInfo.label}</Chip>
            ))}
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug">{e.title}</h3>

        {/* Optional second line: show category inline if you prefer here instead of chip */}
        {!e.category ? null : (
          <div className="mt-1 text-xs text-gray-600 inline-flex items-center gap-1">
            <Tag className="h-3.5 w-3.5" />
            {e.category}
          </div>
        )}

        {/* Footer */}
        <div className="mt-3 flex items-center justify-end">
          <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
            View
            <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ---------- helpers ---------- */

/**
 * Tries multiple shapes safely:
 * - e.pricing?.type === 'paid' with amountMinor/currency
 * - e.pricing?.type === 'free'
 * - e.priceMinor
 * - e.price
 * Returns null if unknown (so we don't show incorrect "Free").
 */
function getPriceInfo(e: any): { label: string; isFree: boolean } | null {
  // Newer shape
  if (e?.pricing?.type === 'paid') {
    const minor = Number(e?.pricing?.amountMinor || 0);
    if (minor > 0) {
      const currency = e?.pricing?.currency || 'GBP';
      return { label: fmtCurrency(minor / 100, currency), isFree: false };
    }
    // Paid but no amount? Treat as unknown → no chip
    return null;
  }
  if (e?.pricing?.type === 'free') {
    return { label: 'Free', isFree: true };
  }

  // Legacy shapes
  if (typeof e?.priceMinor === 'number') {
    if (e.priceMinor > 0) {
      const currency = e?.currency || 'GBP';
      return { label: fmtCurrency(e.priceMinor / 100, currency), isFree: false };
    }
    if (e.priceMinor === 0) return { label: 'Free', isFree: true };
  }
  if (typeof e?.price === 'number') {
    if (e.price > 0) {
      const currency = e?.currency || 'GBP';
      return { label: fmtCurrency(e.price, currency), isFree: false };
    }
    if (e.price === 0) return { label: 'Free', isFree: true };
  }

  // Unknown -> no price chip
  return null;
}

function fmtCurrency(n: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(n);
  } catch {
    return `${n.toFixed(2)} ${currency}`;
  }
}

/* ---------- tiny UI atom ---------- */
function Chip({
  children,
  kind,
}: {
  children: React.ReactNode;
  kind?: 'brand' | 'success';
}) {
  const base =
    'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 backdrop-blur';
  const style =
    kind === 'success'
      ? 'bg-emerald-100/90 text-emerald-700 ring-emerald-200'
      : kind === 'brand'
      ? 'bg-primary/10 text-primary ring-primary/20'
      : 'bg-white/90 text-gray-700 ring-black/10';
  return <span className={`${base} ${style}`}>{children}</span>;
}
