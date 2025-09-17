// src/components/tutors/SlotPicker.tsx
import { useEffect, useMemo, useState } from 'react';
import { getTutorAvailability, type AvailabilitySlot } from '@/lib/tutorDetail.api';
import { todayISO, addDaysISO, groupSlotsByLocalDate, formatLocalTimeRange } from '@/utils/datetime';

type Props = {
  tutorId: string;
  defaultDuration?: number; // minutes; default 60
  onPick: (slot: AvailabilitySlot) => void;
};

export default function SlotPicker({ tutorId, defaultDuration = 60, onPick }: Props) {
  const [from, setFrom] = useState(todayISO());
  const [to, setTo] = useState(addDaysISO(todayISO(), 14));
  const [durationMin, setDurationMin] = useState<number>(defaultDuration);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);

  const grouped = useMemo(() => groupSlotsByLocalDate(slots), [slots]);

  async function load() {
    try {
      setLoading(true);
      setErr('');
      const { slots } = await getTutorAvailability(tutorId, { from, to, durationMin });
      setSlots(slots);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to load availability';
      setErr(msg);
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tutorId, from, to, durationMin]);

  return (
    <div className="rounded-2xl border border-gray-100 p-4">
      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <label className="text-xs text-gray-600">From</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-gray-600">To</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-gray-600">Duration</label>
          <select
            value={durationMin}
            onChange={(e) => setDurationMin(parseInt(e.target.value, 10))}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
          >
            <option value={30}>30 minutes</option>
            <option value={45}>45 minutes</option>
            <option value={60}>60 minutes</option>
            <option value={90}>90 minutes</option>
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={load}
            className="w-full rounded-xl border px-3 py-2 text-sm"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mt-4">
        {loading && <div className="text-gray-600">Loading slots…</div>}
        {!!err && !loading && <div className="text-red-600 text-sm">{err}</div>}

        {!loading && !err && grouped.length === 0 && (
          <div className="text-gray-600">No slots in this range. Try different dates or duration.</div>
        )}

        {!loading && !err && grouped.length > 0 && (
          <div className="space-y-4">
            {grouped.map(({ date, slots }) => (
              <div key={date}>
                <div className="text-sm font-medium text-gray-800 mb-2">
                  {new Date(date + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                </div>
                <div className="flex flex-wrap gap-2">
                  {slots.map((s) => {
                    const { range } = formatLocalTimeRange(s.local.start, s.local.end);
                    return (
                      <button
                        key={s.startAt}
                        onClick={() => onPick(s)}
                        className="rounded-xl border px-3 py-1.5 text-sm hover:bg-gray-50"
                        title={`${s.local.start} → ${s.local.end} (${s.local.timezone})`}
                      >
                        {range}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
