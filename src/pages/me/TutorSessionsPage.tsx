// src/pages/me/TutorSessionsPage.tsx
import { useEffect, useMemo, useState } from 'react';
import {
  tutorListSessions, tutorCompleteSession, tutorApproveCancel,
  type TutoringSession
} from '@/lib/sessions.api';
import { formatMoneyMinor } from '@/utils/money';
import { fmtDateTime, isPast } from '@/utils/datefmt';

export default function TutorSessionsPage() {
  const [statusCsv, setStatusCsv] = useState<string>('confirmed,completed,cancelled');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [items, setItems] = useState<TutoringSession[]>([]);

  async function load() {
    try {
      setLoading(true); setErr('');
      const { items } = await tutorListSessions({ status: statusCsv, limit: 100 });
      setItems(items);
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.message || 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, [statusCsv]);

  const upcoming = useMemo(() => items.filter(s => !isPast(s.endAt)).sort((a,b)=>a.startAt.localeCompare(b.startAt)), [items]);
  const past = useMemo(() => items.filter(s => isPast(s.endAt)).sort((a,b)=>a.startAt.localeCompare(b.startAt)), [items]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="text-2xl font-bold">Tutor Sessions</h1>

      {/* Filters */}
      <div className="mt-4 flex items-center gap-2">
        <label className="text-sm text-gray-600">Statuses</label>
        <input
          className="rounded-xl border px-3 py-2 text-sm w-[320px]"
          value={statusCsv}
          onChange={(e) => setStatusCsv(e.target.value)}
          placeholder="e.g., confirmed,completed,cancelled"
        />
        <button className="rounded-xl border px-3 py-2 text-sm" onClick={load}>Refresh</button>
      </div>

      {loading && <div className="mt-6 text-gray-600">Loading…</div>}
      {!!err && !loading && <div className="mt-6 text-red-600 text-sm">{err}</div>}

      {!loading && !err && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Upcoming */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Upcoming</h2>
            {upcoming.length === 0 && <div className="text-gray-600">No upcoming sessions.</div>}
            <div className="space-y-3">
              {upcoming.map((s) => <TutorSessionCard key={s._id} s={s} refresh={load} />)}
            </div>
          </div>

          {/* Past */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Past</h2>
            {past.length === 0 && <div className="text-gray-600">No past sessions.</div>}
            <div className="space-y-3">
              {past.map((s) => <TutorSessionCard key={s._id} s={s} refresh={load} />)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TutorSessionCard({ s, refresh }: { s: TutoringSession; refresh: () => void }) {
  const { date, time } = fmtDateTime(s.startAt);
  const { time: endTime } = fmtDateTime(s.endAt);
  const price = formatMoneyMinor(s.amountMinor, s.currency);

  async function complete() {
    try { await tutorCompleteSession(s._id); await refresh(); }
    catch (e: any) { alert(e?.response?.data?.message || e?.message || 'Failed to complete'); }
  }
  async function approveCancel() {
    try { await tutorApproveCancel(s._id); await refresh(); }
    catch (e: any) { alert(e?.response?.data?.message || e?.message || 'Failed to approve'); }
  }

  return (
    <div className="rounded-2xl border border-gray-100 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-sm text-gray-600">{date}</div>
          <div className="font-medium">{time} – {endTime}</div>
        </div>
        <div className="text-sm">{price}</div>
        <div>
          <span className={`text-xs rounded-full px-2 py-1 ${badgeClr(s.status)}`}>{s.status}</span>
        </div>
      </div>

      {s.status === 'confirmed' && s.meetingLink && (
        <div className="mt-2">
          <a href={s.meetingLink} target="_blank" className="text-blue-700 text-sm underline">Meeting link</a>
        </div>
      )}

      {/* Pending cancel request */}
      {s.cancelRequest?.requestedAt && !s.cancelRequest?.approvedAt && (
        <div className="mt-2 text-xs text-amber-700 bg-amber-50 inline-block px-2 py-1 rounded">
          Cancel requested: “{s.cancelRequest.reason}”
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {/* Complete (only after endAt, status confirmed) */}
        {s.status === 'confirmed' && isPast(s.endAt) && (
          <button className="rounded-xl border px-3 py-1.5 text-sm" onClick={complete}>Mark completed</button>
        )}

        {/* Approve cancel if requested */}
        {s.status !== 'cancelled' && s.cancelRequest?.requestedAt && !s.cancelRequest.approvedAt && (
          <button className="rounded-xl border px-3 py-1.5 text-sm" onClick={approveCancel}>Approve cancel</button>
        )}
      </div>
    </div>
  );
}

function badgeClr(status: TutoringSession['status']) {
  switch (status) {
    case 'confirmed': return 'bg-green-50 text-green-700';
    case 'payment_pending': return 'bg-blue-50 text-blue-700';
    case 'hold': return 'bg-gray-100 text-gray-700';
    case 'cancelled': return 'bg-gray-100 text-gray-500';
    case 'completed': return 'bg-purple-50 text-purple-700';
    case 'refunded': return 'bg-red-50 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
  }
}
