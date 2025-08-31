import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

/**
 * Watches the URL for `?session_id=...` (Stripe Checkout success)
 * Calls POST /purchase/sync once, then invalidates user-facing caches
 * and cleans query params from the URL.
 */
export default function StripeSuccessWatcher() {
  const { search } = useLocation();
  const qc = useQueryClient();
  const lastSession = useRef<string | null>(null);

  useEffect(() => {
    const qp = new URLSearchParams(search);
    const sessionId = qp.get('session_id');
    if (!sessionId) return;

    // Avoid duplicate calls (React 18 StrictMode + back/forward nav)
    if (lastSession.current === sessionId) return;
    lastSession.current = sessionId;

    (async () => {
      try {
        await api.post('/purchase/sync', { sessionId });

        // Invalidate anything that might reflect access changes
        await Promise.allSettled([
          qc.invalidateQueries({ queryKey: ['me', 'membership'] }),
          qc.invalidateQueries({ queryKey: ['me', 'enrollments'] }),
          qc.invalidateQueries({ queryKey: ['me', 'courses'] }),
          qc.invalidateQueries({ queryKey: ['me', 'live'] }),
          qc.invalidateQueries({ queryKey: ['me', 'resources'] }),
          qc.invalidateQueries({ queryKey: ['me'] }), // common navbar key
        ]);
      } catch (err) {
        console.error('[StripeSuccessWatcher] /purchase/sync failed:', err);
      } finally {
        // Clean the URL (remove `session_id` and optional `purchase` flag)
        const url = new URL(window.location.href);
        url.searchParams.delete('session_id');
        url.searchParams.delete('purchase');
        const clean =
          url.pathname +
          (url.searchParams.toString() ? `?${url.searchParams.toString()}` : '') +
          url.hash;
        window.history.replaceState({}, '', clean);
      }
    })();
  }, [search, qc]);

  return null;
}
