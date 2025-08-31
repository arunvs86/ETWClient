import { useQuery } from '@tanstack/react-query'
import { listCourses } from '../../lib/courses.api'
import CourseCard from '../../components/course/CourseCard'
import FiltersBar from '../../components/course/FiltersBar'
import Pagination from '../../components/course/Pagination'
import { useSearchState } from '../../hooks/useSearchState'

const DEFAULTS = { page: 1, limit: 12, sort: 'newest' }

export default function CoursesList() {
  const { state, update } = useSearchState<{ q?: string; level?: string; isFree?: boolean; sort?: string; page: number; limit: number }>(DEFAULTS)

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ['courses', state],
    queryFn: () => listCourses(state),
    // v5 replacement for keepPreviousData:
    placeholderData: (prev) => prev
  })

  const items = data?.items || []
  const page = data?.meta.page || Number(state.page) || 1
  const hasNext = !!data?.meta.hasNextPage

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Courses</h2>

      <FiltersBar
        value={{ q: (state.q as string) || '', level: state.level as string, isFree: !!state.isFree, sort: (state.sort as string) || 'newest' }}
        onChange={(patch) => update(patch)}
      />

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="aspect-video rounded-lg bg-gray-200" />
              <div className="mt-3 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-2/3" />
                <div className="h-3 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {isError && <div className="text-red-600">Failed to load courses.</div>}

      {!isLoading && !isError && items.length === 0 && (
        <div className="text-gray-600">No courses match your filters.</div>
      )}

{!isLoading && !isError && items.length > 0 && (
  <>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map(c => <CourseCard key={c.slug} course={c} />)}
    </div>

    <div className="pt-4">
      <Pagination
        page={page}
        hasNext={hasNext}
        onChange={(p) => update({ page: p }, false)}
      />
    </div>
  </>
)}
    </div>
  )
}
