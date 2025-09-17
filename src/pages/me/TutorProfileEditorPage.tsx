// src/pages/me/TutorProfileEditorPage.tsx
import { useEffect, useState } from 'react';
import { getMyTutorProfile, upsertMyTutorProfile, type MyTutorProfile } from '@/lib/tutorOwner.api';
import { formatMoneyMinor } from '@/utils/money';

const providers = [
  { v: 'zoom', label: 'Zoom' },
  { v: 'google_meet', label: 'Google Meet' },
  { v: 'custom', label: 'Custom link (paste per session)' },
] as const;

export default function TutorProfileEditorPage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [savedMsg, setSavedMsg] = useState('');
  const [m, setM] = useState<MyTutorProfile>({
    userId: '',
    headline: '',
    bio: '',
    subjects: [],
    languages: [],
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/London',
    hourlyRateMinor: 6000,
    currency: 'GBP',
    meetingProvider: 'zoom',
    meetingNote: '',
    isListed: false,
  });

  useEffect(() => {
    (async () => {
      try {
        setLoading(true); setErr('');
        const { profile } = await getMyTutorProfile();
        if (profile) setM(profile);
      } catch (e: any) {
        setErr(e?.response?.data?.message || e?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function save() {
    try {
      setErr(''); setSavedMsg('');
      const { profile } = await upsertMyTutorProfile(m);
      setM(profile);
      setSavedMsg('Saved!');
      setTimeout(() => setSavedMsg(''), 1500);
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.message || 'Save failed');
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="text-2xl font-bold">Tutor Profile</h1>
      <p className="text-gray-600 text-sm">Fill this out and toggle <span className="font-medium">List me</span> to appear on the Tutors page.</p>

      {loading && <div className="mt-4 text-gray-600">Loading…</div>}
      {!!err && !loading && <div className="mt-4 text-sm text-red-600">{err}</div>}

      {!loading && !err && (
        <div className="mt-5 space-y-4">
          <div>
            <label className="text-xs text-gray-600">Headline</label>
            <input
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
              value={m.headline}
              onChange={(e) => setM({ ...m, headline: e.target.value })}
              placeholder="e.g., UCAT tutor with 5+ years experience"
            />
          </div>

          <div>
            <label className="text-xs text-gray-600">Bio</label>
            <textarea
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm min-h-[120px]"
              value={m.bio}
              onChange={(e) => setM({ ...m, bio: e.target.value })}
              placeholder="Tell students about your experience and approach…"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-600">Subjects (comma separated)</label>
              <input
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                value={m.subjects.join(', ')}
                onChange={(e) => setM({ ...m, subjects: splitCsv(e.target.value) })}
                placeholder="UCAT, BMAT, Biology"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">Languages (comma separated)</label>
              <input
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                value={m.languages.join(', ')}
                onChange={(e) => setM({ ...m, languages: splitCsv(e.target.value) })}
                placeholder="en, fr"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-600">Timezone</label>
              <input
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                value={m.timezone}
                onChange={(e) => setM({ ...m, timezone: e.target.value })}
                placeholder="Europe/London"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">Hourly rate ({m.currency})</label>
              <input
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                type="number"
                min={0}
                value={Math.round(m.hourlyRateMinor / 100)}
                onChange={(e) => {
                  const val = Number(e.target.value || 0);
                  setM({ ...m, hourlyRateMinor: Math.max(0, val) * 100 });
                }}
              />
              <div className="text-xs text-gray-500 mt-1">{formatMoneyMinor(m.hourlyRateMinor, m.currency)} / hour</div>
            </div>
            <div>
              <label className="text-xs text-gray-600">Currency</label>
              <input
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                value={m.currency}
                onChange={(e) => setM({ ...m, currency: e.target.value.toUpperCase() })}
                placeholder="GBP"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-600">Meeting provider</label>
              <select
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                value={m.meetingProvider}
                onChange={(e) => setM({ ...m, meetingProvider: e.target.value as MyTutorProfile['meetingProvider'] })}
              >
                {providers.map(p => <option key={p.v} value={p.v}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-600">Meeting note (optional)</label>
              <input
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                value={m.meetingNote || ''}
                onChange={(e) => setM({ ...m, meetingNote: e.target.value })}
                placeholder="e.g., I’ll send Zoom 24h before"
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={m.isListed}
                onChange={(e) => setM({ ...m, isListed: e.target.checked })}
              />
              <span className="text-sm">List me on Tutors page</span>
            </label>

            <div className="flex gap-2">
              {savedMsg && <span className="self-center text-sm text-emerald-700">{savedMsg}</span>}
              <button onClick={save} className="rounded-xl bg-black text-white px-4 py-2 text-sm hover:bg-gray-800">
                Save
              </button>
            </div>
          </div>

          <div className="rounded-xl border bg-amber-50 text-amber-800 text-xs p-3">
            Tip: After saving and switching <b>List me</b> on, visit <code>/tutors</code> to confirm you appear publicly.
          </div>
        </div>
      )}
    </div>
  );
}

function splitCsv(s: string) {
  return s.split(',').map(x => x.trim()).filter(Boolean);
}
