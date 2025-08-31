import type { CourseListItem } from '../../lib/courses.api'
import { Link } from 'react-router-dom'
import { formatDuration, formatPrice, titleCase } from '../../lib/format'

type Props = { course: CourseListItem }

export default function CourseCard({ course }: Props) {
  const price = formatPrice(course.pricing?.amountMinor ?? 0, course.pricing?.currency ?? 'GBP', course.pricing?.isFree)
  const duration = formatDuration(course.totalDurationSec ?? 0)

  return (
    <div className="card overflow-hidden">
      <Link to={`/courses/${course.slug}`} className="block">
        <div className="aspect-video bg-primary/10">
          {course.thumbnail ? (
            <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" loading="lazy" />
          ) : null}
        </div>
      </Link>
      <div className="p-4 space-y-2">
        <Link to={`/courses/${course.slug}`} className="font-semibold line-clamp-2 hover:underline">{course.title}</Link>
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
          <span className="px-2 py-0.5 rounded bg-muted/40 text-primary">{titleCase(course.level)}</span>
          <span>{duration}</span>
          {typeof course.ratingAvg === 'number' && (
            <span>★ {course.ratingAvg.toFixed(1)} {course.ratingCount ? `(${course.ratingCount})` : ''}</span>
          )}
        </div>
        <div className="pt-1 font-medium text-primary">{price}</div>
      </div>
    </div>
  )
}
