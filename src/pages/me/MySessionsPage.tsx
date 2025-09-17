// src/pages/me/MySessionsPage.tsx
import { useEffect, useMemo, useState } from 'react';
import {
  listMySessions, cancelMySession, requestCancelMySession, rescheduleMySession,
  type TutoringSession
} from '@/lib/sessions.api';
import { formatMoneyMinor } from '@/utils/money';
import { fmtDateTime, isPast } from '@/utils/datefmt';
import RescheduleDialog from '@/components/tutors/RescheduleDialog';

type Tab = 'upcoming'|'past';

export default function MySessionsPage() {
  const [tab, setTab] = useState<Tab>('upcoming');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [items, setItems] = useState<TutoringSession[]>([]);
  const [reschedId, setReschedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return items
      .slice()
      .sort((a, b) => a.startAt.localeCompare(b.startAt))
      .filter(s => tab === 'upcoming' ? !isPast(s.endAt) : isPast(s.endAt));
  }, [items, tab]);

  async function load() {
    try {
      setLoading(true); setErr('');
      // show all statuses for student, default date window not applied for simplicity
      const { items } = await listMySessions({ role: 'student', limit: 100 });
      setItems(items);
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.message || 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function onCancel(id: string) {
    try {
      await cancelMySession(id);
      await load();
    } catch (e: any) {
      alert(e?.response?.data?.message || e?.message || 'Cancel failed. If within 24h, try “Request cancel”.');
    }
  }
  async function onRequestCancel(id: string) {
    const reason = prompt('Reason for cancellation? (sent to tutor)') || '';
    if (!reason.trim()) return;
    try {
      await requestCancelMySession(id, reason.trim());
      await load();
    } catch (e: any) {
      alert(e?.response?.data?.message || e?.message || 'Request failed');
    }
  }

  const target = items.find(i => i._id === reschedId);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="text-2xl font-bold">My Sessions</h1>

      {/* Tabs */}
      <div className="mt-4 flex gap-2">
        <button
          className={`rounded-xl px-3 py-1.5 text-sm border ${tab==='upcoming'?'bg-black text-white border-black':'border-gray-200'}`}
          onClick={() => setTab('upcoming')}
        >Upcoming</button>
        <button
          className={`rounded-xl px-3 py-1.5 text-sm border ${tab==='past'?'bg-black text-white border-black':'border-gray-200'}`}
          onClick={() => setTab('past')}
        >Past</button>
      </div>

      {/* List */}
      <div className="mt-6">
        {loading && <div className="text-gray-600">Loading…</div>}
        {!!err && !loading && <div className="text-red-600 text-sm">{err}</div>}

        {!loading && !err && filtered.length === 0 && (
          <div className="text-gray-600">No sessions here yet.</div>
        )}

        {!loading && !err && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((s) => {
              const { date, time } = fmtDateTime(s.startAt);
              const { time: endTime } = fmtDateTime(s.endAt);
              const price = formatMoneyMinor(s.amountMinor, s.currency);
              return (
                <div key={s._id} className="rounded-2xl border border-gray-100 p-4">
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

                  {/* Meeting Link */}
                  {s.status === 'confirmed' && s.meetingLink && (
                    <div className="mt-2">
                      <a href={s.meetingLink} target="_blank" className="text-blue-700 text-sm underline">Join meeting</a>
                    </div>
                  )}

                  {/* Cancel request info */}
                  {s.cancelRequest?.requestedAt && (
                    <div className="mt-2 text-xs text-amber-700 bg-amber-50 inline-block px-2 py-1 rounded">
                      Cancel requested: “{s.cancelRequest.reason}” (pending tutor approval)
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {/* Cancel (>24h allowed) */}
                    {s.status === 'confirmed' && !isPast(s.startAt) && (
                      <button
                        className="rounded-xl border px-3 py-1.5 text-sm"
                        onClick={() => onCancel(s._id)}
                      >Cancel</button>
                    )}

                    {/* Request cancel (<=24h) */}
                    {s.status === 'confirmed' && !isPast(s.startAt) && (
                      <button
                        className="rounded-xl border px-3 py-1.5 text-sm"
                        onClick={() => onRequestCancel(s._id)}
                      >Request cancel</button>
                    )}

                    {/* Reschedule (>24h only per backend rule) */}
                    {s.status === 'confirmed' && !isPast(s.startAt) && (
                      <button
                        className="rounded-xl border px-3 py-1.5 text-sm"
                        onClick={() => setReschedId(s._id)}
                      >Reschedule</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reschedule dialog */}
      <RescheduleDialog
        open={!!reschedId}
        onClose={() => setReschedId(null)}
        initialStartAt={target?.startAt}
        initialEndAt={target?.endAt}
        onSubmit={async (payload) => {
          if (!reschedId) return;
          await rescheduleMySession(reschedId, payload);
          await load();
        }}
      />
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
