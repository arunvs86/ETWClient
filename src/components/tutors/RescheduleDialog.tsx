// src/components/tutors/RescheduleDialog.tsx
import { useEffect, useState } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: { startAt: string; endAt: string }) => Promise<void> | void;
  initialStartAt?: string;
  initialEndAt?: string;
};

export default function RescheduleDialog({ open, onClose, onSubmit, initialStartAt, initialEndAt }: Props) {
  const [startAt, setStartAt] = useState(initialStartAt || '');
  const [endAt, setEndAt] = useState(initialEndAt || '');
  const [err, setErr] = useState('');

  useEffect(() => {
    if (open) {
      setStartAt(initialStartAt || '');
      setEndAt(initialEndAt || '');
      setErr('');
    }
  }, [open, initialStartAt, initialEndAt]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-xl">
        <h3 className="text-lg font-semibold">Reschedule session</h3>
        <p className="text-xs text-gray-600 mt-1">
          Enter new start and end times in ISO (UTC). (MVP: you can wire a slot picker here later.)
        </p>
        {err && <div className="text-sm text-red-600 mt-2">{err}</div>}

        <div className="mt-3 space-y-2">
          <input
            className="w-full rounded-xl border px-3 py-2 text-sm"
            placeholder="StartAt (e.g. 2025-09-22T17:00:00.000Z)"
            value={startAt}
            onChange={(e) => setStartAt(e.target.value)}
          />
          <input
            className="w-full rounded-xl border px-3 py-2 text-sm"
            placeholder="EndAt (e.g. 2025-09-22T18:00:00.000Z)"
            value={endAt}
            onChange={(e) => setEndAt(e.target.value)}
          />
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button className="rounded-xl border px-3 py-2 text-sm" onClick={onClose}>Cancel</button>
          <button
            className="rounded-xl bg-black text-white px-3 py-2 text-sm"
            onClick={async () => {
              try {
                if (!startAt || !endAt) { setErr('Both startAt and endAt are required'); return; }
                await onSubmit({ startAt, endAt });
                onClose();
              } catch (e: any) {
                setErr(e?.response?.data?.message || e?.message || 'Failed to reschedule');
              }
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
