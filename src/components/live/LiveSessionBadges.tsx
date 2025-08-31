import type { LiveSessionPricing, MembersAccess } from '@/lib/liveSessions.api'

export default function LiveSessionBadges({ pricing, membersAccess }: { pricing: LiveSessionPricing; membersAccess: MembersAccess }) {
  const tags: { key: string; label: string; cls: string }[] = []

  if (pricing?.type === 'free') tags.push({ key: 'price-free', label: 'Free', cls: 'bg-green-100 text-green-800' })
  if (pricing?.type === 'paid') tags.push({ key: 'price-paid', label: 'Paid', cls: 'bg-gray-100 text-gray-800' })

  if (membersAccess === 'free') tags.push({ key: 'members-free', label: 'Free for Members', cls: 'bg-indigo-100 text-indigo-800' })
  if (membersAccess === 'paid') tags.push({ key: 'members-paid', label: 'Members pay', cls: 'bg-amber-100 text-amber-800' })

  return (
    <div className="flex flex-wrap gap-1">
      {tags.map(t => (
        <span key={t.key} className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${t.cls}`}>
          {t.label}
        </span>
      ))}
    </div>
  )
}
