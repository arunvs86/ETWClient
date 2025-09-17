// src/pages/me/TutorAvailabilityEditorPage.tsx
import { useEffect, useState } from 'react';
import {
  getMyTutorAvailability,
  saveMyTutorAvailability,
  type MyAvailability,
} from '@/lib/tutorOwner.api';

type Row = { date: string; start: string; end: string };

const DEFAULTS: MyAvailability = {
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/London',
  slotSizeMin: 60,
  bufferMin: 0,
  weekly: [],
  exceptions: [],
};

function isValidTime(t: string) {
  return /^\d{2}:\d{2}$/.test(t);
}
function toMin(hhmm: string) {
  const [h, m] = (hhmm || '').split(':').map(n => parseInt(n || '0', 10));
  if (Number.isNaN(h) || Number.isNaN(m)) return NaN;
  return h * 60 + m;
}
function minToHHMM(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
}
function isValidRow(r: Row) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(r.date)) return false;
  if (!isValidTime(r.start) || !isValidTime(r.end)) return false;
  return toMin(r.end) > toMin(r.start);
}

export default function TutorAvailabilityEditorPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const [timezone, setTimezone] = useState(DEFAULTS.timezone);
  const [slotSizeMin, setSlotSizeMin] = useState(DEFAULTS.slotSizeMin);
  const [bufferMin, setBufferMin] = useState(DEFAULTS.bufferMin);
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr('');
        const res = await getMyTutorAvailability();
        const a = res.availability || DEFAULTS;
        setTimezone(a.timezone || DEFAULTS.timezone);
        setSlotSizeMin(typeof a.slotSizeMin === 'number' ? a.slotSizeMin : DEFAULTS.slotSizeMin);
        setBufferMin(typeof a.bufferMin === 'number' ? a.bufferMin : DEFAULTS.bufferMin);

        // Map any stored exceptions to rows (handles DB minutes or friendly shape)
        const mapped: Row[] = (a.exceptions || []).flatMap(e => {
          if (!e?.date) return [];
          // DB shape single window
          if (typeof e.startMin === 'number' && typeof e.endMin === 'number') {
            return [{ date: e.date, start: minToHHMM(e.startMin), end: minToHHMM(e.endMin) }];
          }
          // Friendly single window
          if (e.start && e.end) {
            return [{ date: e.date, start: e.start, end: e.end }];
          }
          // Blocks (friendly or DB)
          if (Array.isArray(e.blocks)) {
            return e.blocks.map(b => {
              if (typeof b?.startMin === 'number' && typeof b?.endMin === 'number') {
                return { date: e.date, start: minToHHMM(b.startMin), end: minToHHMM(b.endMin) };
              }
              return { date: e.date, start: b?.start || '09:00', end: b?.end || '10:00' };
            });
          }
          return [];
        }).sort((a,b)=> (a.date+a.start).localeCompare(b.date+b.start));

        setRows(mapped);
      } catch (e: any) {
        setErr(e?.response?.data?.message || e?.message || 'Failed to load availability');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function addRow() {
    const today = new Date().toISOString().slice(0,10);
    setRows(r => [...r, { date: today, start: '09:00', end: '10:00' }]);
  }
  function updateRow(i: number, patch: Partial<Row>) {
    setRows(r => {
      const copy = r.slice();
      copy[i] = { ...copy[i], ...patch };
      return copy;
    });
  }
  function removeRow(i: number) {
    setRows(r => r.filter((_, idx) => idx !== i));
  }

  async function onSave() {
    try {
      setErr('');
      setOk('');
      setSaving(true);

      // validate rows
      if (!timezone) throw new Error('Timezone is required.');
      if (slotSizeMin < 15) throw new Error('Slot size must be at least 15 minutes.');
      if (bufferMin < 0) throw new Error('Buffer cannot be negative.');
      const bad = rows.find(r => !isValidRow(r));
      if (bad) throw new Error('Fix invalid rows (date must be YYYY-MM-DD, end > start).');

      // build payload: we ONLY use exceptions (date windows); weekly stays empty
      const exceptions = rows
        .slice()
        .sort((a,b)=> (a.date+a.start).localeCompare(b.date+b.start))
        .map(r => ({ date: r.date, start: r.start, end: r.end }));

      const payload: MyAvailability = {
        timezone,
        slotSizeMin,
        bufferMin,
        weekly: [],          // keep weekly empty (simple UX)
        exceptions,          // friendly shape; backend normalizer converts it
      };

      const { availability } = await saveMyTutorAvailability(payload);

      // reflect server truth back into rows
      const normalizedRows: Row[] = (availability.exceptions || []).flatMap(e => {
        if (!e?.date) return [];
        if (typeof e.startMin === 'number' && typeof e.endMin === 'number') {
          return [{ date: e.date, start: minToHHMM(e.startMin), end: minToHHMM(e.endMin) }];
        }
        if (e.start && e.end) return [{ date: e.date, start: e.start, end: e.end }];
        if (Array.isArray(e.blocks)) {
          return e.blocks.map(b => {
            if (typeof b?.startMin === 'number' && typeof b?.endMin === 'number') {
              return { date: e.date, start: minToHHMM(b.startMin), end: minToHHMM(b.endMin) };
            }
            return { date: e.date, start: b?.start || '09:00', end: b?.end || '10:00' };
          });
        }
        return [];
      }).sort((a,b)=> (a.date+a.start).localeCompare(b.date+b.start));

      setRows(normalizedRows);
      setOk('Saved!');
      setTimeout(() => setOk(''), 1500);
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="text-2xl font-semibold">Your Availability</h1>
      <p className="text-gray-600 text-sm">Add the exact dates and time windows you can teach.</p>

      {loading && <div className="mt-4 text-gray-600">Loading…</div>}
      {!!err && !loading && <div className="mt-4 text-sm text-red-600">{err}</div>}
      {!!ok && !loading && <div className="mt-4 text-sm text-emerald-700">{ok}</div>}

      {!loading && (
        <div className="mt-5 space-y-5">
          {/* Basics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-600">Timezone</label>
              <input
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                value={timezone}
                onChange={(e)=>setTimezone(e.target.value)}
                placeholder="Europe/London"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">Default slot size (min)</label>
              <input
                type="number"
                min={15}
                step={15}
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                value={slotSizeMin}
                onChange={(e)=>setSlotSizeMin(Math.max(15, parseInt(e.target.value || '60', 10)))}
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">Buffer between sessions (min)</label>
              <input
                type="number"
                min={0}
                step={5}
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                value={bufferMin}
                onChange={(e)=>setBufferMin(Math.max(0, parseInt(e.target.value || '0', 10)))}
              />
            </div>
          </div>

          {/* Date rows */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Specific dates</h2>
            <button onClick={addRow} className="rounded-xl border px-3 py-2 text-sm">Add</button>
          </div>

          {rows.length === 0 && (
            <div className="text-sm text-gray-600">Click “Add” to create your first slot.</div>
          )}

          <div className="mt-3 space-y-3">
            {rows.map((r, i) => (
              <div key={i} className="rounded-xl border p-3 grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs text-gray-600">Date</label>
                  <input
                    type="date"
                    className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                    value={r.date}
                    onChange={(e)=>updateRow(i, { date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600">Start</label>
                  <input
                    type="time"
                    className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                    value={r.start}
                    onChange={(e)=>updateRow(i, { start: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600">End</label>
                  <input
                    type="time"
                    className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                    value={r.end}
                    onChange={(e)=>updateRow(i, { end: e.target.value })}
                  />
                </div>
                <div className="flex items-end">
                  <button onClick={()=>removeRow(i)} className="w-full rounded-xl border px-3 py-2 text-sm">Remove</button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end">
            <button
              onClick={onSave}
              disabled={saving}
              className="rounded-xl bg-black text-white px-4 py-2 text-sm hover:bg-gray-800 disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>

          <div className="rounded-xl border bg-slate-50 text-slate-700 text-xs p-3">
            Students will only see slots inside these date windows (adjusted for your timezone).
          </div>
        </div>
      )}
    </div>
  );
}
