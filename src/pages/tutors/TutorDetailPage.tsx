// src/pages/tutors/TutorDetailPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import { getTutorPublicDetail, createTutoringCheckout, type TutorPublicDetail, type AvailabilitySlot } from '@/lib/tutorDetail.api';
import { formatMoneyMinor } from '@/utils/money';
import SlotPicker from '@/components/tutors/SlotPicker';
import { ensureAuth } from '@/lib/api';

export default function TutorDetailPage() {
  const { tutorId = '' } = useParams();
  const nav = useNavigate();
  const loc = useLocation();

  const [data, setData] = useState<TutorPublicDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  async function load() {
    try {
      setLoading(true);
      setErr('');
      const d = await getTutorPublicDetail(tutorId);
      setData(d);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to load tutor';
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tutorId]);

  async function handlePick(slot: AvailabilitySlot) {
    // auth gate: if ensureAuth() fails, send to login with returnTo
    const ok = await ensureAuth();
    if (!ok) {
      const ret = encodeURIComponent(loc.pathname + loc.search);
      nav(`/login?returnTo=${ret}`);
      return;
    }
    try {
      const { url } = await createTutoringCheckout(tutorId, {
        startAt: slot.startAt,
        endAt: slot.endAt
      });
      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Could not start checkout';
      alert(msg);
    }
  }

  const headline = data?.profile.headline || '';
  const subjects = data?.profile.subjects || [];
  const languages = data?.profile.languages || [];
  const price = formatMoneyMinor(data?.profile.hourlyRateMinor, data?.profile.currency || 'GBP');

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-4">
        <Link to="/tutors" className="text-sm text-blue-700 hover:underline">← Back to Tutors</Link>
      </div>

      {loading && <div className="text-gray-600">Loading…</div>}
      {!!err && !loading && <div className="text-red-600 text-sm">{err}</div>}

      {!loading && !err && data && (
        <>
          {/* Header */}
          <div className="flex items-start gap-4">
            <img
              src={data.user.avatar || '/images/avatar-placeholder.png'}
              alt={data.user.name}
              className="h-16 w-16 rounded-full object-cover"
            />
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{data.user.name}</h1>
              <div className="text-gray-700">{headline}</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {subjects.map((s) => (
                  <span key={s} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{s}</span>
                ))}
                {languages.length > 0 && (
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">{languages.join(', ')}</span>
                )}
              </div>
              <div className="mt-3 text-sm">
                <span className="font-semibold">{price}</span> <span className="text-gray-600">/ hour</span>
              </div>
            </div>
          </div>

          {/* Bio */}
          {data.profile.bio && (
            <div className="mt-4 whitespace-pre-wrap text-gray-800">{data.profile.bio}</div>
          )}

          {/* Availability + Booking */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Availability</h2>
            <SlotPicker tutorId={tutorId} defaultDuration={60} onPick={handlePick} />
            <p className="mt-2 text-xs text-gray-600">
              Times shown in tutor’s timezone ({data.profile.timezone}). Stripe Checkout opens to complete your booking.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
