type Props = { value: string; onChange: (v: string) => void }
const OPTIONS = [
  { v: 'newest', label: 'Newest' },
  { v: 'popular', label: 'Popular' },
  { v: 'rating', label: 'Rating' },
  { v: 'price_asc', label: 'Price: Low to High' },
  { v: 'price_desc', label: 'Price: High to Low' },
]

export default function SortSelect({ value, onChange }: Props) {
  return (
    <select
      className="h-10 border border-border rounded-md px-3 bg-surface"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {OPTIONS.map(o => <option key={o.v} value={o.v}>{o.label}</option>)}
    </select>
  )
}
