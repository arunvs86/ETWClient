// src/components/purchases/PurchasedRail.tsx
import { Link } from 'react-router-dom';
import { useMyPurchases } from '@/hooks/useMyPurchases';
import type { PurchaseKind } from '@/lib/purchases.api';

function fmtMoney(minor = 0, currency: 'GBP'|'USD'|'EUR' = 'GBP') {
  if (!minor) return 'Free';
  const n = minor / 100;
  try { return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(n); }
  catch { return `${n.toFixed(2)} ${currency}`; }
}

export default function PurchasedRail({
  title = 'My Purchases',
  kinds,
  limit = 6,
  emptyText = 'No purchases yet.',
  className = '',
}: {
  title?: string;
  kinds?: PurchaseKind[] | string;
  limit?: number;
  emptyText?: string;
  className?: string;
}) {
  const { data, isLoading, isError } = useMyPurchases({ kinds, page: 1, limit });

  if (isLoading) {
    return (
      <div className={`space-y-3 ${className}`}>
        <h3 className="text-sm font-semibold">{title}</h3>
        <div className="grid gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg border p-2">
              <div className="h-12 w-12 rounded bg-gray-100 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-3/4 rounded bg-gray-100 animate-pulse" />
                <div className="h-3 w-1/3 rounded bg-gray-100 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) return null;

  const items = data.items || [];

  return (
    <div className={className}>
      <h3 className="mb-2 text-sm font-semibold">{title}</h3>
      {items.length === 0 ? (
        <div className="rounded-md border border-dashed p-3 text-sm text-gray-600">{emptyText}</div>
      ) : (
        <ul className="grid gap-2">
          {items.map((it) => (
            <li key={it.id} className="flex items-center gap-3 rounded-lg border p-2">
              {it.thumbnail ? (
                <img
                  src={it.thumbnail}
                  alt={it.title}
                  className="h-12 w-12 rounded object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="grid h-12 w-12 place-items-center rounded bg-gray-50 text-xs text-gray-400">
                  {it.kind}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{it.title}</div>
                <div className="truncate text-xs text-gray-600">
                  {new Date(it.purchasedAt).toLocaleDateString()} • {fmtMoney(it.priceMinor, it.currency)}
                </div>
              </div>

              <Link
                to={it.deepLink}
                className="shrink-0 rounded-md border bg-white px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                Open
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
