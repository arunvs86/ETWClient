// src/pages/tutors/BookingSuccessPage.tsx
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function BookingSuccessPage() {
  const [sp] = useSearchParams();
  const nav = useNavigate();
  const sid = sp.get('sid'); // CHECKOUT_SESSION_ID

  useEffect(() => {
    // Optional: you could poll your /me/tutoring-sessions for confirmed,
    // but webhook should flip status quickly. Keep this simple for now.
  }, []);

  return (
    <div className="mx-auto max-w-lg px-4 py-10 text-center">
      <h1 className="text-2xl font-bold">Payment successful 🎉</h1>
      <p className="mt-2 text-gray-700">
        We’re confirming your booking with the tutor now. You’ll see it in “My Sessions” shortly.
      </p>
      {sid && <p className="mt-1 text-xs text-gray-500">Ref: {sid}</p>}

      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          onClick={() => nav('/me/sessions')}
          className="rounded-xl bg-black text-white px-4 py-2 text-sm hover:bg-gray-800"
        >
          Go to My Sessions
        </button>
        <Link to="/tutors" className="text-sm text-blue-700 hover:underline">
          Book another tutor
        </Link>
      </div>
    </div>
  );
}
