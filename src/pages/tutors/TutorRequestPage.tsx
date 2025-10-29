// src/pages/tutors/TutorRequestPage.tsx
import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { createTutorRequestCheckout } from '@/lib/tutorRequest.api';
import { ensureAuth } from '@/lib/api';
import {
  Loader2,
  AlertTriangle,
  HelpCircle,
  CalendarClock,
  PoundSterling,
  UserSearch,
} from 'lucide-react';

export default function TutorRequestPage() {
  const nav = useNavigate();
  const loc = useLocation();
  const cancelled = new URLSearchParams(loc.search).get('cancelled') === '1';

  const [subject, setSubject] = useState('');
  const [level, setLevel] = useState('');
  const [availabilityPref, setAvailabilityPref] = useState('');
  const [urgency, setUrgency] = useState<'urgent' | 'soon' | 'flexible'>('soon');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Basic guard
    if (!subject.trim()) {
      setErr('Please describe what you need help with.');
      return;
    }

    try {
      setSubmitting(true);
      setErr('');

      // ensure logged in; if not logged in, bounce to login and stop
      const ok = await ensureAuth();
      if (!ok) {
        const ret = encodeURIComponent('/tutors/request');
        nav(`/login?returnTo=${ret}`);
        return;
      }

      const { url } = await createTutorRequestCheckout({
        subject,
        level,
        availabilityPref,
        urgency,
        notes,
      });

      // send user to Stripe Checkout
      window.location.href = url;
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        'Could not start checkout';
      setErr(msg);
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <div className="mb-5">
        <Link
          to="/tutors"
          className="text-sm text-blue-700 hover:underline"
        >
          ← Back to Tutors
        </Link>
      </div>

      <div className="mb-6">
        <div className="flex items-start gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10">
            <UserSearch className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-semibold tracking-tight">
              Request a tutor for you
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Tell us what you need. We’ll match you with a tutor within 72
              hours, or we’ll reach out to you about next steps.
            </p>
          </div>
        </div>

        {cancelled && (
          <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-amber-800 text-sm flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <div>Checkout was cancelled. You can submit again below.</div>
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border bg-white p-5 shadow-sm space-y-5"
      >
        {/* Subject / Help needed */}
        <div>
          <label className="block text-sm font-medium text-gray-800">
            What do you need help with?
          </label>
          <p className="text-xs text-gray-500 mb-1">
            e.g. “UCAT verbal reasoning”, “GCSE Maths algebra”, “OSCE
            practice”, “Academic CV review”
          </p>
          <input
            className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </div>

        {/* Level */}
        <div>
          <label className="block text-sm font-medium text-gray-800">
            Level / Exam (optional)
          </label>
          <p className="text-xs text-gray-500 mb-1">
            e.g. “Year 10 GCSE”, “A-level Biology”, “Medical school interview
            prep”.
          </p>
          <input
            className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            placeholder="A-level Biology / UCAT / MBBS OSCE..."
          />
        </div>

        {/* Availability */}
        <div>
          <label className="block text-sm font-medium text-gray-800">
            Preferred times (optional)
          </label>
          <p className="text-xs text-gray-500 mb-1">
            When can you usually do sessions? (example: “Weeknights after 6pm
            UK, weekends anytime”)
          </p>
          <input
            className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20"
            value={availabilityPref}
            onChange={(e) => setAvailabilityPref(e.target.value)}
          />
        </div>

        {/* Urgency */}
        <div>
          <label className="block text-sm font-medium text-gray-800">
            How urgent is this?
          </label>
          <div className="mt-1 flex flex-col gap-2 sm:flex-row">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                className="h-4 w-4"
                checked={urgency === 'urgent'}
                onChange={() => setUrgency('urgent')}
              />
              <span>Urgent (within a few days)</span>
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                className="h-4 w-4"
                checked={urgency === 'soon'}
                onChange={() => setUrgency('soon')}
              />
              <span>Soon (this week / next)</span>
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                className="h-4 w-4"
                checked={urgency === 'flexible'}
                onChange={() => setUrgency('flexible')}
              />
              <span>Flexible / just exploring</span>
            </label>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-800">
            Anything else? (optional)
          </label>
          <p className="text-xs text-gray-500 mb-1">
            Tell us about your goals, problem areas, exam date, or anything
            important for us to know.
          </p>
          <textarea
            className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20"
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Info / price */}
        <div className="rounded-xl border bg-gray-50 p-4 text-sm text-gray-700 flex flex-col gap-3">
          <div className="flex items-start gap-2">
            <PoundSterling className="h-4 w-4 shrink-0 text-gray-600" />
            <div>
              <div className="font-medium">One-time fee: £30</div>
              <div className="text-xs text-gray-600">
                This covers manual matching. If we can’t arrange a suitable
                tutor, we’ll contact you to discuss next steps.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <CalendarClock className="h-4 w-4 shrink-0 text-gray-600" />
            <div>
              <div className="font-medium">Timeline</div>
              <div className="text-xs text-gray-600">
                You’ll get an email from us within 72 hours.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <HelpCircle className="h-4 w-4 shrink-0 text-gray-600" />
            <div className="text-xs text-gray-600">
              You don’t have to chase us. We’ll update you by email.
            </div>
          </div>
        </div>

        {/* Error */}
        {err && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <div>{err}</div>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex w-full items-center justify-center rounded-xl bg-black px-3 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing…
            </>
          ) : (
            <>Pay £30 &amp; Submit Request</>
          )}
        </button>

        <p className="text-[11px] leading-relaxed text-gray-500 text-center">
          By continuing, you agree to be contacted at the email linked to your
          account. This helps us match you with a suitable tutor.
        </p>
      </form>
    </div>
  );
}
