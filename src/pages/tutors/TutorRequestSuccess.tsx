// src/pages/tutors/TutorRequestSuccess.tsx
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { confirmTutorRequest } from '@/lib/tutorRequest.api';
import {
  CheckCircle,
  AlertTriangle,
  Loader2,
  Mail,
  ArrowRight,
} from 'lucide-react';

type Status = 'confirming' | 'confirmed' | 'error';

export default function TutorRequestSuccess() {
  const [sp] = useSearchParams();
  const navigate = useNavigate();

  const sid = sp.get('sid') || ''; // Stripe session id
  const rid = sp.get('rid') || ''; // TutorRequest id

  const [status, setStatus] = useState<Status>('confirming');
  const [err, setErr] = useState('');

  const confirm = useCallback(async () => {
    if (!sid || !rid) {
      setErr('Missing confirmation details.');
      setStatus('error');
      return;
    }
    try {
      setErr('');
      setStatus('confirming');
      const data = await confirmTutorRequest(rid, sid);
      if (data?.ok) {
        setStatus('confirmed');
      } else {
        setErr('Could not confirm request.');
        setStatus('error');
      }
    } catch (e: any) {
      const msg =
        e?.response?.data?.error ||
        e?.response?.data?.message ||
        e?.message ||
        'Could not confirm request.';
      setErr(msg);
      setStatus('error');
    }
  }, [sid, rid]);

  useEffect(() => {
    confirm();
  }, [confirm]);

  return (
    <div className="mx-auto max-w-xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Thank you
        </h1>
        <p className="text-sm text-muted-foreground">
          We’ve received your request.
        </p>
      </div>

      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        {status === 'confirming' && (
          <div className="flex flex-col items-center text-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
            <div className="space-y-1">
              <p className="font-medium">Finalising your request…</p>
              <p className="text-sm text-muted-foreground">
                We’re confirming your payment and logging your details.
              </p>
            </div>

            <div className="mt-2 grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                onClick={confirm}
                className="inline-flex items-center justify-center rounded-xl border px-3 py-2 text-sm font-medium hover:bg-gray-50"
              >
                Retry
              </button>
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center justify-center rounded-xl bg-black px-3 py-2 text-sm font-medium text-white hover:opacity-90"
              >
                Back to Home
              </button>
            </div>
          </div>
        )}

        {status === 'confirmed' && (
          <div className="flex flex-col items-center text-center gap-4">
            <CheckCircle className="h-7 w-7 text-green-600" aria-hidden />
            <div className="space-y-1">
              <p className="text-lg font-semibold">Request received</p>
              <p className="text-sm text-muted-foreground">
                Our team will email you within 72 hours with your tutor match
                or next steps.
              </p>
            </div>

            <div className="w-full rounded-xl bg-gray-50 p-4 text-left">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" aria-hidden />
                <p className="text-sm font-medium">What happens now?</p>
              </div>
              <ul className="mt-2 list-disc pl-5 text-sm text-gray-700">
                <li>
                  We’ll review your request and find the best available tutor.
                </li>
                <li>
                  You’ll get an email from us (check your spam folder too).
                </li>
                <li>
                  We’ll aim to get back to you in under 72 hours.
                </li>
              </ul>
            </div>

            <div className="mt-1 grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center justify-center rounded-xl bg-black px-3 py-2 text-sm font-medium text-white hover:opacity-90"
              >
                Back to Home <ArrowRight className="ml-1 h-4 w-4" />
              </button>
              <Link
                to="/tutors"
                className="inline-flex items-center justify-center rounded-xl border px-3 py-2 text-sm font-medium hover:bg-gray-50"
              >
                Browse Tutors
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center text-center gap-3">
            <AlertTriangle className="h-6 w-6 text-amber-600" aria-hidden />
            <div className="space-y-1">
              <p className="font-semibold">We couldn’t confirm automatically</p>
              <p className="text-sm text-muted-foreground">
                {err || 'Please try again or contact support.'}
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
                to="/tutors"
                className="inline-flex items-center justify-center rounded-xl bg-black px-3 py-2 text-sm font-medium text-white hover:opacity-90"
              >
                Tutors
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
        If you don’t see an email from us after 72 hours, please reach out to support.
      </div>
    </div>
  );
}
