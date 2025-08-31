// src/pages/billing/LiveCheckoutSuccessPage.tsx
import { CheckCircle } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { confirmLivePurchase } from '@/lib/liveSessions.api';

export default function LiveCheckoutSuccessPage() {
  const [sp] = useSearchParams();
  const nav = useNavigate();
  const sessionId = sp.get('session_id');
  const [liveId, setLiveId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = localStorage.getItem('lastLiveCheckout');
        const data = raw ? JSON.parse(raw) : null;
        if (data?.type === 'live' && data?.liveId && sessionId) {
          setLiveId(data.liveId);
          await confirmLivePurchase(data.liveId, sessionId);
          localStorage.removeItem('lastLiveCheckout');
          if (!mounted) return;
          setTimeout(() => nav(`/live/${data.liveId}?purchased=1`), 400);
        } else {
          setTimeout(() => nav('/live'), 800);
        }
      } catch {
        setTimeout(() => {
          if (liveId) nav(`/live/${liveId}?purchased=1`);
          else nav('/live');
        }, 800);
      } finally {
        if (mounted) setConfirming(false);
      }
    })();
    return () => { mounted = false; };
  }, [nav, sessionId]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
      <h1 className="text-3xl font-semibold text-gray-800 mb-2">Payment Successful 🎉</h1>
      <p className="text-gray-600 max-w-md mb-6">
        {confirming ? 'Activating your access…' : 'Your access is active. You can continue.'}
      </p>

      <div className="flex gap-4">
        {liveId ? (
          <Link to={`/live/${liveId}?purchased=1`} className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2 text-white hover:opacity-90 shadow">
            Continue to your live session
          </Link>
        ) : (
          <Link to="/live" className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2 text-white hover:opacity-90 shadow">
            View Live Sessions
          </Link>
        )}
        <Link to="/" className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50">
          Home
        </Link>
      </div>

      {sessionId && <div className="mt-8 text-xs text-gray-400">Transaction ID: {sessionId}</div>}
    </div>
  );
}
