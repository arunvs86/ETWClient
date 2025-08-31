import { useEffect, useRef, useState } from 'react'
import SortSelect from './SortSelect'

type Filters = {
  q?: string
  category?: string
  level?: string
  isFree?: boolean
  sort?: string
}

type Props = {
  value: Filters
  onChange: (patch: Partial<Filters>) => void
}

export default function FiltersBar({ value, onChange }: Props) {
  const [q, setQ] = useState(value.q || '')
  const debounceRef = useRef<number | null>(null)

  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current)
    debounceRef.current = window.setTimeout(() => {
      onChange({ q })
    }, 350)
    return () => { if (debounceRef.current) window.clearTimeout(debounceRef.current) }
  }, [q]) // eslint-disable-line

  return (
    <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
      <div className="flex-1 flex gap-2">
        <input
          className="h-10 w-full md:w-96 border border-border rounded-md px-3"
          placeholder="Search courses"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="h-10 border border-border rounded-md px-3 bg-surface"
          value={value.level || ''}
          onChange={(e) => onChange({ level: e.target.value || undefined })}
        >
          <option value="">All levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>

        <label className="inline-flex items-center gap-2 text-sm px-3 h-10 border border-border rounded-md bg-surface">
          <input
            type="checkbox"
            checked={!!value.isFree}
            onChange={(e) => onChange({ isFree: e.target.checked || undefined })}
          />
          Free only
        </label>
      </div>

      <div className="flex items-center gap-2">
        <SortSelect value={value.sort || 'newest'} onChange={(v) => onChange({ sort: v })} />
      </div>
    </div>
  )
}
