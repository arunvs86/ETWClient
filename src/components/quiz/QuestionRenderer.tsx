import { useMemo } from 'react'
import type { PlayQuestion } from '@/lib/publicQuizzes.api'

export type AnswerValue =
  | { selectedOptionIds: string[] }
  | { booleanAnswer: boolean }
  | { textAnswer: string }

export default function QuestionRenderer({
  q,
  value,
  onChange,
}: {
  q: PlayQuestion
  value: AnswerValue | undefined
  onChange: (val: AnswerValue) => void
}) {
  const v = value ?? (q.type === 'mcq' || q.type === 'multi'
    ? { selectedOptionIds: [] }
    : q.type === 'boolean'
      ? { booleanAnswer: false }
      : { textAnswer: '' })

  if (q.type === 'mcq' || q.type === 'multi') {
    const selected = new Set((v as any).selectedOptionIds as string[])
    const toggle = (id: string) => {
      if (q.type === 'mcq') {
        onChange({ selectedOptionIds: [id] })
      } else {
        const next = new Set(selected)
        next.has(id) ? next.delete(id) : next.add(id)
        onChange({ selectedOptionIds: Array.from(next) })
      }
    }

    return (
      <div className="space-y-2">
        {(q.options || []).map((o) => {
          const isSel = selected.has(o.id)
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => toggle(o.id)}
              className={`flex w-full items-start gap-3 rounded-lg border px-3 py-2 text-left transition
                ${isSel ? 'border-black bg-black text-white' : 'bg-white hover:bg-gray-50'}
              `}
            >
              <span className={`mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded border ${isSel ? 'bg-white text-black' : ''}`}>
                {q.type === 'mcq' ? (isSel ? '●' : '○') : (isSel ? '✓' : '')}
              </span>
              <div>
                <div className="font-medium">{o.text || `Option ${o.id}`}</div>
              </div>
            </button>
          )
        })}
      </div>
    )
  }

  if (q.type === 'boolean') {
    const cur = (v as any).booleanAnswer as boolean
    return (
      <div className="flex gap-3">
        <label className="inline-flex items-center gap-2">
          <input
            type="radio"
            name={`bool-${q.id}`}
            checked={cur === true}
            onChange={() => onChange({ booleanAnswer: true })}
          />
          True
        </label>
        <label className="inline-flex items-center gap-2">
          <input
            type="radio"
            name={`bool-${q.id}`}
            checked={cur === false}
            onChange={() => onChange({ booleanAnswer: false })}
          />
          False
        </label>
      </div>
    )
  }

  // short
  return (
    <input
      className="input"
      placeholder="Type your answer…"
      value={(v as any).textAnswer || ''}
      onChange={(e) => onChange({ textAnswer: e.target.value })}
    />
  )
}
