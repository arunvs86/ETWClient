// src/pages/public/PublicLiveSessionView.tsx
import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '@/components/ui/Button';
import {
  getLiveSession,
  getEntitlement,
  joinLiveSession,
  devPurchaseLiveSession,
  prettyPrice,
  createLiveSessionCheckout,
  type PublicLiveSession,
} from '@/lib/liveSessions.api';
import LiveSessionBadges from '@/components/live/LiveSessionBadges';
import { useAuth } from '@/context/AuthProvider';

const JOIN_WINDOW_MIN = Number(import.meta.env.VITE_LIVE_JOIN_WINDOW_MINUTES || '10');

function Pill({ children, tone='gray' }: { children: React.ReactNode; tone?: 'gray'|'blue'|'green'|'amber' }) {
  const map = {
    gray: 'bg-gray-100 text-gray-800',
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    amber: 'bg-amber-100 text-amber-800',
  } as const;
  return <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${map[tone]}`}>{children}</span>;
}

export default function PublicLiveSessionView() {
  const { id = '' } = useParams();
  const nav = useNavigate();
  const qc = useQueryClient();
  const { user, loading } = useAuth();

  const qSession = useQuery({
    queryKey: ['liveSession', id],
    queryFn: () => getLiveSession(id),
    enabled: !!id,
    staleTime: 15_000,
  });

  const qEnt = useQuery({
    queryKey: ['liveSessionEnt', id],
    queryFn: () => getEntitlement(id),
    enabled: !!id && !loading && !!user,
    staleTime: 0, // always refetch fresh (server no-cache too)
  });

  const session = qSession.data;
  const { joinOpen, startsIn } = useJoinWindow(session);

  const needAuth = !loading && !user;
  const ent = qEnt.data;
  const isEntitled = !!ent && 'canJoin' in ent && ent.canJoin;
  const priceLabel = prettyPrice(session?.pricing);

  async function onJoin() {
    try {
      const r = await joinLiveSession(id);
      if (!r.ok || !r.url) {
        alert(`Cannot join: ${r.reason || 'unknown'}`);
        return;
      }
      window.open(r.url, '_blank', 'noopener,noreferrer');
    } catch (e: any) {
      alert(e?.response?.data?.error || 'Join failed');
    }
  }

  async function onDevBuy() {
    try {
      await devPurchaseLiveSession(id);
      await qc.invalidateQueries({ queryKey: ['liveSessionEnt', id] });
      alert('Dev purchase created. You should be able to join now.');
    } catch (e: any) {
      alert(e?.response?.data?.error || 'Dev purchase failed');
    }
  }

  async function onBuy() {
    try {
      const res = await createLiveSessionCheckout(id);
      if (res?.sessionId) {
        localStorage.setItem('lastLiveCheckout', JSON.stringify({ type: 'live', liveId: id, sessionId: res.sessionId, ts: Date.now() }));
      }
      if (res?.checkoutUrl) {
        window.location.href = res.checkoutUrl;
      } else {
        alert('Checkout failed: no URL returned.');
      }
    } catch (e: any) {
      alert(e?.response?.data?.error || 'Checkout failed (is the endpoint implemented?)');
    }
  }

  // Poll entitlement briefly if we get redirected back with ?purchased=1
  const [pollEntitlement, setPollEntitlement] = useState(false);
  const [pollUntil, setPollUntil] = useState<number | null>(null);

  useEffect(() => {
    const u = new URLSearchParams(window.location.search);
    if (u.get('purchased') === '1') setPollEntitlement(true);
  }, []);
  useEffect(() => { if (pollEntitlement && !pollUntil) setPollUntil(Date.now() + 60_000); }, [pollEntitlement, pollUntil]);
  useEffect(() => {
    if (!pollEntitlement) return;
    const i = setInterval(() => {
      if (pollUntil && Date.now() > pollUntil) { setPollEntitlement(false); clearInterval(i); return; }
      qc.invalidateQueries({ queryKey: ['liveSessionEnt', id] });
    }, 1500);
    return () => clearInterval(i);
  }, [pollEntitlement, pollUntil, id, qc]);
  useEffect(() => { if (isEntitled) setPollEntitlement(false); }, [isEntitled]);

  const isLoading = qSession.isLoading;
  const isError = qSession.isError || (!qSession.isLoading && !session);

  return (
    <div className="space-y-6">
      <HeaderBlock loading={isLoading} error={!!isError} session={session} />

      <div className="grid gap-6 lg:grid-cols-[1.6fr,1fr]">
        <div className="space-y-4">
          <section className="rounded-2xl border bg-white p-5">
            <h2 className="text-base font-semibold mb-2">Overview</h2>
            {isLoading ? (
              <div className="space-y-3">
                <div className="h-4 w-3/4 rounded bg-gray-100 animate-pulse" />
                <div className="h-4 w-2/3 rounded bg-gray-100 animate-pulse" />
                <div className="h-48 rounded bg-gray-100 animate-pulse" />
              </div>
            ) : isError ? (
              <div className="text-red-600">Session not found.</div>
            ) : (
              <>
                <p className="text-gray-700 whitespace-pre-line">{session?.description || 'No description provided.'}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-gray-700">
                  <Pill tone="blue">Timezone: {session?.timezone || 'Europe/London'}</Pill>
                  {session && <LiveSessionBadges pricing={session.pricing} membersAccess={session.membersAccess} />}
                  {!!startsIn && <Pill tone="amber">Starts in {startsIn}</Pill>}
                </div>
                {session?.thumbnail && (
                  <div className="mt-4 overflow-hidden rounded-lg border">
                    <img src={session.thumbnail} alt="" className="w-full h-auto object-cover" />
                  </div>
                )}
              </>
            )}
          </section>
        </div>

        <aside className="lg:sticky lg:top-6 h-min">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-bold text-primary">
                {isLoading ? <span className="inline-block h-8 w-28 rounded bg-gray-100 animate-pulse" /> : priceLabel}
              </div>
              {!isLoading && session && (
                <Pill tone={session.status === 'scheduled' ? 'amber' : session.status === 'live' ? 'green' : 'gray'}>
                  {session.status[0].toUpperCase()+session.status.slice(1)}
                </Pill>
              )}
            </div>

            <div className="mt-4">
              {isLoading ? (
                <Button disabled full>Loading…</Button>
              ) : isError ? (
                <Button disabled full>Unavailable</Button>
              ) : needAuth ? (
                <Button onClick={() => nav(`/login?next=/live/${session!.id}`)} full>Login to continue</Button>
              ) : qEnt.isLoading ? (
                <Button disabled full>Checking access…</Button>
              ) : isEntitled ? (
                joinOpen ? (
                  <Button onClick={onJoin} full>Join now</Button>
                ) : (
                  <Button disabled full title={`Join opens ~${JOIN_WINDOW_MIN} min before start`}>Join (not open yet)</Button>
                )
              ) : session!.pricing.type === 'paid' ? (
                session!.membersAccess === 'free' ? (
                  <Button onClick={() => nav('/billing/plans')} full>Get membership</Button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Button onClick={onBuy} full>Buy access</Button>
                    {import.meta.env.DEV && import.meta.env.VITE_LIVESESSIONS_DEV_FAKE_PURCHASE === 'true' && (
                      <button onClick={onDevBuy} className="text-xs underline text-gray-600">Dev: simulate purchase</button>
                    )}
                  </div>
                )
              ) : (
                <Button disabled full>Join (not allowed)</Button>
              )}
            </div>

            <div className="mt-2 text-xs text-gray-500">
              {pollEntitlement
                ? 'Activating your purchase… (this can take a few seconds)'
                : <button onClick={() => qc.invalidateQueries({ queryKey: ['liveSessionEnt', id] })} className="underline">Refresh access</button>
              }
            </div>

            <ul className="mt-4 space-y-1 text-xs text-gray-600">
              <li>• Join opens about {JOIN_WINDOW_MIN} minutes before start time.</li>
              <li>• You’ll join in a new tab.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

function HeaderBlock({ loading, error, session }: { loading: boolean; error: boolean; session?: PublicLiveSession }) {
  if (loading) return <div className="h-28 rounded-2xl bg-gradient-to-r from-indigo-50 to-violet-50 animate-pulse" />;
  const start = session ? new Date(session.startAt) : null;
  const end = session ? new Date(session.endAt) : null;
  return (
    <header className="relative overflow-hidden rounded-2xl border bg-gradient-to-r from-indigo-50 to-violet-50">
      <div className="p-5 md:p-7">
        {error ? (
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">Session unavailable</h1>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2 text-xs text-indigo-700/90">
              <span className="inline-flex h-6 items-center rounded bg-indigo-100 px-2 font-medium text-indigo-800">
                Scheduled
              </span>
              <span>{start?.toLocaleDateString()}</span>
              <span>•</span>
              <span>
                {start?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {end?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span>•</span>
              <span>Timezone: {session?.timezone || 'Europe/London'}</span>
            </div>
            <h1 className="mt-2 text-2xl md:text-3xl font-semibold text-gray-900">{session?.title}</h1>
            {session?.description && <p className="mt-1 text-gray-700 line-clamp-2">{session.description}</p>}
          </>
        )}
      </div>
    </header>
  );
}

function useJoinWindow(session?: PublicLiveSession) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  const start = session ? new Date(session.startAt) : null;
  const end = session ? new Date(session.endAt) : null;
  const openFrom = start ? new Date(start.getTime() - JOIN_WINDOW_MIN * 60 * 1000) : null;
  const joinOpen = !!(start && end && now >= openFrom! && now <= new Date(end.getTime() + 5 * 60 * 1000));
  const startsIn = useMemo(() => {
    if (!start) return '';
    if (now >= start) return '';
    const diff = +start - +now;
    const h = Math.floor(diff / 3_600_000);
    const m = Math.floor((diff % 3_600_000) / 60_000);
    const sec = Math.floor((diff % 60_000) / 1000);
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${sec}s`;
    return `${sec}s`;
  }, [now, session?.startAt]);
  return { joinOpen, startsIn };
}
