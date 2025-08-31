import Button from '../ui/Button'

type Props = {
  page: number
  hasNext: boolean
  onChange: (nextPage: number) => void
}

export default function Pagination({ page, hasNext, onChange }: Props) {
  return (
    <div className="flex items-center justify-center gap-2">
      <Button variant="ghost" disabled={page <= 1} onClick={() => onChange(page - 1)}>Previous</Button>
      <span className="text-sm text-gray-600">Page {page}</span>
      <Button variant="ghost" disabled={!hasNext} onClick={() => onChange(page + 1)}>Next</Button>
    </div>
  )
}
