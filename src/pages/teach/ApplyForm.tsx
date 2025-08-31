import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import { applyInstructor } from '../../lib/instructorApp.api'

function csvToArray(v: string): string[] {
  return v.split(',').map(s => s.trim()).filter(Boolean)
}

export default function ApplyForm({ defaultDisplayName = '' }:{ defaultDisplayName?: string }) {
  const nav = useNavigate()
  const [displayName, setDisplayName] = useState(defaultDisplayName)
  const [bio, setBio] = useState('')
  const [website, setWebsite] = useState('')
  const [links, setLinks] = useState('')
  const [categories, setCategories] = useState('')
  const [samples, setSamples] = useState('')
  const [agree, setAgree] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    if (!displayName.trim()) { setErr('Display name is required'); return }
    if (bio.trim().length < 30) { setErr('Bio must be at least 30 characters'); return }
    if (!agree) { setErr('You must agree to the Instructor Terms'); return }

    setSubmitting(true)
    try {
      await applyInstructor({
        displayName: displayName.trim(),
        bio: bio.trim(),
        website: website.trim() || undefined,
        links: links ? csvToArray(links) : [],
        categories: categories ? csvToArray(categories) : [],
        samples: samples ? csvToArray(samples) : [],
        agreeTerms: true
      })
      nav('/me/instructor/application', { replace: true })
    } catch (e: any) {
      setErr(e?.response?.data?.message || 'Failed to submit application')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto card p-6 space-y-4">
      <h2 className="text-xl font-semibold">Apply to teach</h2>
      <p className="text-gray-700 text-sm">Tell us a bit about your background. We’ll review and get back to you.</p>

      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block text-sm">Display name
          <input className="mt-1 w-full border border-border rounded-md h-10 px-3"
            value={displayName} onChange={e=>setDisplayName(e.target.value)} />
        </label>

        <label className="block text-sm">Bio (min 30 chars)
          <textarea
            className="mt-1 w-full border border-border rounded-md px-3 py-2 min-h-[120px]"
            value={bio}
            onChange={e=>setBio(e.target.value)}
            // If you still see odd behavior in React 19 dev, swap to onInput:
            // onInput={(e)=>setBio((e.target as HTMLTextAreaElement).value)}
          />
        </label>

        <div className="grid sm:grid-cols-2 gap-3">
          <label className="block text-sm">Website (optional)
            <input className="mt-1 w-full border border-border rounded-md h-10 px-3"
              value={website} onChange={e=>setWebsite(e.target.value)} />
          </label>
          <label className="block text-sm">Categories (comma)
            <input className="mt-1 w-full border border-border rounded-md h-10 px-3"
              placeholder="ucat, medicine"
              value={categories} onChange={e=>setCategories(e.target.value)} />
          </label>
        </div>

        <label className="block text-sm">Links (comma, optional)
          <input className="mt-1 w-full border border-border rounded-md h-10 px-3"
            placeholder="https://twitter.com/…, https://linkedin.com/in/…"
            value={links} onChange={e=>setLinks(e.target.value)} />
        </label>

        <label className="block text-sm">Sample content URLs (comma, optional)
          <input className="mt-1 w-full border border-border rounded-md h-10 px-3"
            placeholder="https://youtube.com/watch?v=…"
            value={samples} onChange={e=>setSamples(e.target.value)} />
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={agree} onChange={e=>setAgree(e.target.checked)} />
          I agree to the Instructor Terms
        </label>

        {err && <div className="text-sm text-red-600">{err}</div>}

        <div className="flex items-center gap-2">
          <Button disabled={submitting}>{submitting ? 'Submitting…' : 'Submit application'}</Button>
          <Button type="button" variant="ghost" onClick={() => nav('/me/instructor/application')}>View status</Button>
        </div>
      </form>
    </div>
  )
}
