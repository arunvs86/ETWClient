// src/components/tutors/TutorCard.tsx
import { Link } from 'react-router-dom';
import { formatMoneyMinor } from '@/utils/money';
import type { TutorListItem } from '@/lib/tutors.api';

type Props = { tutor: TutorListItem };

export default function TutorCard({ tutor }: Props) {
  const { user, headline, subjects = [], languages = [], hourlyRateMinor, currency, userId } = tutor;

  return (
    <div className="rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition">
      <div className="flex items-center gap-3">
        <img
          src={user?.avatar || '/images/avatar-placeholder.png'}
          alt={user?.name || 'Tutor'}
          className="h-12 w-12 rounded-full object-cover"
        />
        <div className="min-w-0">
          <div className="font-semibold truncate">{user?.name || 'Tutor'}</div>
          <div className="text-sm text-gray-600 truncate">{headline}</div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {subjects?.slice(0, 4).map((s) => (
          <span key={s} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
            {s}
          </span>
        ))}
        {languages?.length ? (
          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
            {languages.join(', ')}
          </span>
        ) : null}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm">
          <span className="font-semibold">{formatMoneyMinor(hourlyRateMinor, currency)}</span>
          <span className="text-gray-600"> / hour</span>
        </div>
        <Link
          to={`/tutors/${userId}`}
          className="inline-flex items-center rounded-xl px-3 py-2 text-sm bg-black text-white hover:bg-gray-800"
        >
          View profile
        </Link>
      </div>
    </div>
  );
}
