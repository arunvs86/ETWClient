import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import { useAuth } from '../../context/AuthProvider'
import { getMyInstructorApplication } from '../../lib/instructorApp.api'
import ApplyForm from './ApplyForm'

export default function Teach() {
  const nav = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [existing, setExisting] = useState<Awaited<ReturnType<typeof getMyInstructorApplication>>>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const app = await getMyInstructorApplication()
        if (mounted) setExisting(app)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    if (user?.role === 'instructor') {
      nav('/instructor/new', { replace: true })
    }
  }, [user, nav])

  if (loading) return <div className="p-6">Loading…</div>

  if (existing?.status === 'pending') {
    return (
      <div className="max-w-2xl mx-auto card p-6 space-y-4">
        <h2 className="text-xl font-semibold">Application submitted</h2>
        <p className="text-gray-700">
          Thanks, {existing.answers.displayName}. Your application is currently <b>pending</b>.
          We’ll notify you once it’s reviewed.
        </p>
        <Button onClick={() => nav('/me/instructor/application')}>View status</Button>
      </div>
    )
  }

  if (existing?.status === 'approved') {
    return (
      <div className="max-w-2xl mx-auto card p-6 space-y-4">
        <h2 className="text-xl font-semibold">You’re approved 🎉</h2>
        <p className="text-gray-700">You can start creating courses right away.</p>
        <Button onClick={() => nav('/instructor/new')}>Create your first course</Button>
      </div>
    )
  }

  if (existing?.status === 'rejected') {
    return (
      <div className="max-w-2xl mx-auto card p-6 space-y-4">
        <h2 className="text-xl font-semibold">Application rejected</h2>
        {existing.review?.reason && <p className="text-red-700 text-sm">Reason: {existing.review.reason}</p>}
        <p className="text-gray-700">You can update your details and re-apply below.</p>
        <ApplyForm key="apply-form" defaultDisplayName={user?.name || ''} />
      </div>
    )
  }

  // No existing app → show form
  return <ApplyForm key="apply-form" defaultDisplayName={user?.name || ''} />
}
