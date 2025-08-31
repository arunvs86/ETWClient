import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import { getMyInstructorApplication } from '../../lib/instructorApp.api'
import { useAuth } from '../../context/AuthProvider'

export default function ApplicationStatus() {
  const nav = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [app, setApp] = useState<Awaited<ReturnType<typeof getMyInstructorApplication>>>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const a = await getMyInstructorApplication()
        if (mounted) setApp(a)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  if (loading) return <div className="p-6">Loading…</div>

  if (!app) {
    return (
      <div className="max-w-xl mx-auto card p-6 space-y-4">
        <h2 className="text-xl font-semibold">No application yet</h2>
        <p className="text-gray-700">Start your instructor application.</p>
        <Button onClick={() => nav('/teach')}>Apply to teach</Button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto card p-6 space-y-4">
      <h2 className="text-xl font-semibold">Application status</h2>
      <div className="text-sm">Submitted: {new Date(app.createdAt).toLocaleString()}</div>
      <StatusBadge status={app.status} />

      {app.status === 'pending' && (
        <>
          <p className="text-gray-700">Thanks, {app.answers.displayName}. Your application is under review.</p>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => nav('/teach')}>Edit & Re-apply</Button>
          </div>
        </>
      )}

      {app.status === 'approved' && (
        <>
          <p className="text-gray-700">You’ve been approved{app.review?.reviewedAt ? ` on ${new Date(app.review.reviewedAt).toLocaleDateString()}` : ''}.</p>
          <Button onClick={() => nav('/instructor/new')}>Create your first course</Button>
        </>
      )}

      {app.status === 'rejected' && (
        <>
          {app.review?.reason && <div className="text-sm text-red-700">Reason: {app.review.reason}</div>}
          <div className="flex gap-2">
            <Button onClick={() => nav('/teach')}>Re-apply</Button>
          </div>
        </>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: 'pending' | 'approved' | 'rejected' }) {
  const map = {
    pending: 'bg-warning text-white',
    approved: 'bg-accent text-white',
    rejected: 'bg-red-600 text-white'
  } as const
  return <span className={`inline-block text-xs px-2 py-1 rounded ${map[status]} capitalize`}>{status}</span>
}
