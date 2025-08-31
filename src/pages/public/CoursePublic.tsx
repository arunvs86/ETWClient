import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getCourseBySlug } from '../../lib/courses.api'
import { formatDuration, formatPrice, titleCase } from '../../lib/format'
import Button from '../../components/ui/Button'

export default function CoursePublic() {
  const { slug = '' } = useParams()
  const { data, isLoading, isError } = useQuery({
    queryKey: ['course', slug],
    queryFn: () => getCourseBySlug(slug),
    enabled: !!slug
  })

  if (isLoading) {
    return <div className="space-y-3">
      <div className="h-8 w-2/3 bg-gray-200 rounded" />
      <div className="h-4 w-1/2 bg-gray-200 rounded" />
      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="h-40 bg-gray-200 rounded" />
        <div className="h-40 bg-gray-200 rounded" />
      </div>
    </div>
  }

  if (isError || !data) {
    return <div className="text-red-600">Course not found.</div>
  }

  const price = formatPrice(data.pricing?.amountMinor ?? 0, data.pricing?.currency ?? 'GBP', data.pricing?.isFree)
  const duration = formatDuration(data.totalDurationSec ?? 0)

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">{data.title}</h1>
        {data.subtitle ? <p className="text-gray-700">{data.subtitle}</p> : null}

        <div className="flex flex-wrap gap-2 text-xs text-gray-600">
          <span className="px-2 py-0.5 rounded bg-muted/40 text-primary">{titleCase(data.level)}</span>
          <span>{data.language?.toUpperCase?.()}</span>
          {typeof data.ratingAvg === 'number' && <span>★ {data.ratingAvg.toFixed(1)} {data.ratingCount ? `(${data.ratingCount})` : ''}</span>}
          <span>{duration}</span>
        </div>

        {data.description && (
          <div className="card p-4 prose max-w-none">
            <h3 className="font-medium mb-2">About this course</h3>
            <p className="text-gray-800 whitespace-pre-line">{data.description}</p>
          </div>
        )}

        {Array.isArray(data.sections) && data.sections.length > 0 && (
          <div className="card p-4">
            <h3 className="font-medium mb-2">Syllabus</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              {data.sections.map(s => (
                <li key={s.id}>
                  <div className="font-medium">{s.title}</div>
                  {Array.isArray(s.lessons) && s.lessons.length > 0 && (
                    <ul className="ml-4 list-disc space-y-1">
                      {s.lessons.map(l => <li key={l.id}>{l.title}</li>)}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <aside className="card p-4 h-fit space-y-3">
        <div className="text-3xl font-bold text-primary">{price}</div>
        <Button full disabled title="Enrollment wired in next step">{
          data.pricing?.isFree ? 'Enroll for free' : 'Unlock with membership'
        }</Button>
        <p className="text-xs text-gray-600">You’ll enroll from here in the next step.</p>
        {data.thumbnail && <img src={data.thumbnail} alt={data.title} className="rounded-md" />}
      </aside>
    </div>
  )
}
