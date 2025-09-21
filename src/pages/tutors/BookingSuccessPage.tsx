// import { useEffect, useState } from 'react';
// import { useSearchParams, Link } from 'react-router-dom';
// import { api } from '@/lib/api';

// export default function BookingSuccess() {
//   const [sp] = useSearchParams();
//   const sid = sp.get('sid') || '';
//   const tid = sp.get('tid') || '';
//   const [status, setStatus] = useState('confirming');
//   const [err, setErr] = useState('');
//   const [meetingLink, setMeetingLink] = useState<string | null>(null);

//   useEffect(() => {
//     (async () => {
//       try {
//         // mirror live: confirm on server using the session id
//         const { data } = await api.post(`/me/tutoring-sessions/${encodeURIComponent(tid)}/confirm`, { sessionId: sid });
//         setStatus(data.status || 'confirmed');
//         setMeetingLink(data.meetingLink || null);
//       } catch (e: any) {
//         setErr(e?.response?.data?.error || e?.message || 'Could not confirm booking');
//         setStatus('error');
//       }
//     })();
//   }, [sid, tid]);

//   return (
//     <div className="mx-auto max-w-lg p-6">
//       <h1 className="text-2xl font-bold mb-2">Booking</h1>
//       {err && <div className="text-red-600 text-sm mb-3">{err}</div>}
//       {status === 'confirming' && <div>Finalizing your booking…</div>}
//       {status === 'confirmed' && (
//         <div className="space-y-3">
//           <div className="text-green-700">Payment confirmed ✓</div>
//           {meetingLink ? (
//             <a className="text-blue-700 underline" href={meetingLink} target="_blank">Join meeting</a>
//           ) : (
//             <div className="text-sm text-gray-600">Meeting link will be emailed.</div>
//           )}
//           <Link to="/me/sessions" className="text-sm underline">Go to My Sessions</Link>
//         </div>
//       )}
//       {status === 'error' && (
//         <div className="space-y-2">
//           <div className="text-amber-700">We couldn’t confirm automatically.</div>
//           <Link to="/me/sessions" className="text-sm underline">Check My Sessions</Link>
//         </div>
//       )}
//     </div>
//   );
// }


// src/pages/BookingSuccess.tsx
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { CheckCircle, AlertTriangle, Loader2, CalendarClock, ArrowRight } from 'lucide-react';

type Status = 'confirming' | 'confirmed' | 'error';

export default function BookingSuccess() {
  const [sp] = useSearchParams();
  const navigate = useNavigate();

  const sid = sp.get('sid') || ''; // Stripe session id
  const tid = sp.get('tid') || ''; // Tutoring session id

  const [status, setStatus] = useState<Status>('confirming');
  const [err, setErr] = useState('');

  const confirm = useCallback(async () => {
    if (!sid || !tid) {
      setErr('Missing confirmation details.');
      setStatus('error');
      return;
    }
    setErr('');
    setStatus('confirming');
    try {
      const { data } = await api.post(
        `/me/tutoring-sessions/${encodeURIComponent(tid)}/confirm`,
        { sessionId: sid }
      );
      setStatus((data.status as Status) || 'confirmed');
    } catch (e: any) {
      setErr(e?.response?.data?.error || e?.message || 'Could not confirm booking.');
      setStatus('error');
    }
  }, [sid, tid]);

  useEffect(() => {
    confirm();
  }, [confirm]);

  return (
    <div className="mx-auto max-w-xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Booking</h1>
        <p className="text-sm text-muted-foreground">
          We’re finalising your tutoring session details.
        </p>
      </div>

      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        {status === 'confirming' && (
          <div className="flex flex-col items-center text-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
            <div className="space-y-1">
              <p className="font-medium">Finalising your booking…</p>
              <p className="text-sm text-muted-foreground">
                This usually takes a moment. You’ll get a confirmation email shortly.
              </p>
            </div>
            <div className="mt-2 grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                onClick={confirm}
                className="inline-flex items-center justify-center rounded-xl border px-3 py-2 text-sm font-medium hover:bg-gray-50"
              >
                Retry
              </button>
              <Link
                to="/me/sessions"
                className="inline-flex items-center justify-center rounded-xl bg-black px-3 py-2 text-sm font-medium text-white hover:opacity-90"
              >
                View My Sessions
              </Link>
            </div>
          </div>
        )}

        {status === 'confirmed' && (
          <div className="flex flex-col items-center text-center gap-4">
            <CheckCircle className="h-7 w-7 text-green-600" aria-hidden />
            <div className="space-y-1">
              <p className="text-lg font-semibold">Payment confirmed</p>
              <p className="text-sm text-muted-foreground">
                Your session is booked. We’ve emailed you the meeting details and calendar invite.
              </p>
            </div>

            <div className="w-full rounded-xl bg-gray-50 p-4 text-left">
              <div className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4" aria-hidden />
                <p className="text-sm font-medium">What’s next?</p>
              </div>
              <ul className="mt-2 list-disc pl-5 text-sm text-gray-700">
                <li>Check your inbox for a confirmation email.</li>
                <li>Download the attached calendar invite to add it to your calendar.</li>
                <li>You can always see details under <b>My Sessions</b>.</li>
              </ul>
            </div>

            <div className="mt-1 grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
              <Link
                to="/me/sessions"
                className="inline-flex items-center justify-center rounded-xl bg-black px-3 py-2 text-sm font-medium text-white hover:opacity-90"
              >
                Go to My Sessions <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center justify-center rounded-xl border px-3 py-2 text-sm font-medium hover:bg-gray-50"
              >
                Back to Home
              </button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center text-center gap-3">
            <AlertTriangle className="h-6 w-6 text-amber-600" aria-hidden />
            <div className="space-y-1">
              <p className="font-semibold">We couldn’t confirm automatically</p>
              <p className="text-sm text-muted-foreground">
                {err || 'Please try again or view your sessions.'}
              </p>
            </div>
            <div className="mt-1 grid w-full grid-cols-1 gap-2 sm:grid-cols-3">
              <button
                onClick={confirm}
                className="inline-flex items-center justify-center rounded-xl border px-3 py-2 text-sm font-medium hover:bg-gray-50"
              >
                Retry
              </button>
              <Link
                to="/me/sessions"
                className="inline-flex items-center justify-center rounded-xl bg-black px-3 py-2 text-sm font-medium text-white hover:opacity-90"
              >
                My Sessions
              </Link>
              <button
                onClick={() => navigate('/support')}
                className="inline-flex items-center justify-center rounded-xl border px-3 py-2 text-sm font-medium hover:bg-gray-50"
              >
                Contact Support
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 text-xs text-muted-foreground">
        If you don’t receive an email in a few minutes, check your spam folder or contact support.
      </div>
    </div>
  );
}
