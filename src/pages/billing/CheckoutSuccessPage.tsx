import { CheckCircle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function CheckoutSuccessPage() {
  const loc = useLocation();
  const params = new URLSearchParams(loc.search);
  const sessionId = params.get("session_id");

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      {/* Success Icon */}
      <CheckCircle className="w-16 h-16 text-green-500 mb-4" />

      {/* Headline */}
      <h1 className="text-3xl font-semibold text-gray-800 mb-2">
        Payment Successful 🎉
      </h1>
      <p className="text-gray-600 max-w-md mb-6">
        Thanks for your purchase! Your <span className="font-medium">Lifetime Membership</span> is now active.  
        You can start learning right away.
      </p>

      {/* Action buttons */}
      <div className="flex gap-4">
        <Link
          to="/me/enrollments"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2 text-white hover:opacity-90 shadow"
        >
          Go to My Learning
        </Link>
        <Link
          to="/courses"
          className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50"
        >
          Browse Courses
        </Link>
      </div>

      {/* Extra info (optional) */}
      {sessionId && (
        <div className="mt-8 text-xs text-gray-400">
          Transaction ID: {sessionId}
        </div>
      )}
    </div>
  );
}
