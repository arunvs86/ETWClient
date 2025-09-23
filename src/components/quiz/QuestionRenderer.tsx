// import { useMemo } from 'react'
// import type { PlayQuestion } from '@/lib/publicQuizzes.api'

// export type AnswerValue =
//   | { selectedOptionIds: string[] }
//   | { booleanAnswer: boolean }
//   | { textAnswer: string }

// export default function QuestionRenderer({
//   q,
//   value,
//   onChange,
// }: {
//   q: PlayQuestion
//   value: AnswerValue | undefined
//   onChange: (val: AnswerValue) => void
// }) {
//   const v = value ?? (q.type === 'mcq' || q.type === 'multi'
//     ? { selectedOptionIds: [] }
//     : q.type === 'boolean'
//       ? { booleanAnswer: false }
//       : { textAnswer: '' })
  
//       // Add near top
// function OptionMedia({ media }: { media?: Array<{ kind: string; url: string; alt?: string }> }) {
//   if (!media?.length) return null;
//   const imgs = media.filter(m => m.kind === 'image' && m.url);
//   if (!imgs.length) return null;
//   return (
//     <div className="mt-2 grid grid-cols-1 gap-2">
//       {imgs.map((m, i) => (
//         <img
//           key={i}
//           src={m.url}
//           alt={m.alt || 'option image'}
//           loading="lazy"
//           className="max-h-40 w-full rounded-md border bg-white object-contain"
//         />
//       ))}
//     </div>
//   );
// }

//   if (q.type === 'mcq' || q.type === 'multi') {
//     const selected = new Set((v as any).selectedOptionIds as string[])
//     const toggle = (id: string) => {
//       if (q.type === 'mcq') {
//         onChange({ selectedOptionIds: [id] })
//       } else {
//         const next = new Set(selected)
//         next.has(id) ? next.delete(id) : next.add(id)
//         onChange({ selectedOptionIds: Array.from(next) })
//       }
//     }

//     return (
//       <div className="space-y-2">
//         {(q.options || []).map((o) => {
//           const isSel = selected.has(o.id)
//           return (
//             <button
//               key={o.id}
//               type="button"
//               onClick={() => toggle(o.id)}
//               className={`flex w-full items-start gap-3 rounded-lg border px-3 py-2 text-left transition
//                 ${isSel ? 'border-black bg-black text-white' : 'bg-white hover:bg-gray-50'}
//               `}
//             >
//               <span className={`mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded border ${isSel ? 'bg-white text-black' : ''}`}>
//                 {q.type === 'mcq' ? (isSel ? '●' : '○') : (isSel ? '✓' : '')}
//               </span>
//               <div>
//                 <div className="font-medium">{o.text || `Option ${o.id}`}</div>
//               </div>
//             </button>
//           )
//         })}
//       </div>
//     )
//   }

//   if (q.type === 'boolean') {
//     const cur = (v as any).booleanAnswer as boolean
//     return (
//       <div className="flex gap-3">
//         <label className="inline-flex items-center gap-2">
//           <input
//             type="radio"
//             name={`bool-${q.id}`}
//             checked={cur === true}
//             onChange={() => onChange({ booleanAnswer: true })}
//           />
//           True
//         </label>
//         <label className="inline-flex items-center gap-2">
//           <input
//             type="radio"
//             name={`bool-${q.id}`}
//             checked={cur === false}
//             onChange={() => onChange({ booleanAnswer: false })}
//           />
//           False
//         </label>
//       </div>
//     )
//   }

//   // short
//   return (
//     <input
//       className="input"
//       placeholder="Type your answer…"
//       value={(v as any).textAnswer || ''}
//       onChange={(e) => onChange({ textAnswer: e.target.value })}
//     />
//   )
// }
import type { PlayQuestion } from '@/lib/publicQuizzes.api'

export type AnswerValue =
  | { selectedOptionIds: string[] }
  | { booleanAnswer: boolean }
  | { textAnswer: string }

function QuestionMedia({ media }: { media?: Array<{ kind: string; url: string; alt?: string }> }) {
  if (!media?.length) return null
  const imgs = media.filter((m) => m.kind === 'image' && m.url)
  if (!imgs.length) return null

  return (
    <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
      {imgs.map((m, i) => (
        <figure
          key={i}
          className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200"
          title={m.alt || 'question image'}
        >
          <div className="aspect-[16/9] w-full">
            <img
              src={m.url}
              alt={m.alt || 'question image'}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
        </figure>
      ))}
    </div>
  )
}

function OptionMedia({ media }: { media?: Array<{ kind: string; url: string; alt?: string }> }) {
  if (!media?.length) return null
  const imgs = media.filter((m) => m.kind === 'image' && m.url)
  if (!imgs.length) return null

  return (
    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
      {imgs.map((m, i) => (
        <div key={i} className="overflow-hidden rounded-lg ring-1 ring-gray-200">
          <div className="aspect-[4/3] w-full">
            <img
              src={m.url}
              alt={m.alt || 'option image'}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function QuestionRenderer({
  q,
  value,
  onChange,
}: {
  q: PlayQuestion
  value: AnswerValue | undefined
  onChange: (val: AnswerValue) => void
}) {
  const v =
    value ??
    (q.type === 'mcq' || q.type === 'multi'
      ? { selectedOptionIds: [] }
      : q.type === 'boolean'
      ? { booleanAnswer: false }
      : { textAnswer: '' })

  // MCQ / Multi
  if (q.type === 'mcq' || q.type === 'multi') {
    const selected = new Set((v as any).selectedOptionIds as string[])
    const toggle = (id: string) => {
      if (q.type === 'mcq') onChange({ selectedOptionIds: [id] })
      else {
        const next = new Set(selected)
        next.has(id) ? next.delete(id) : next.add(id)
        onChange({ selectedOptionIds: Array.from(next) })
      }
    }

    return (
      <div className="space-y-3">
        {/* Question prompt media */}
        <QuestionMedia media={q.media} />

        {(q.options || []).map((o) => {
          const isSel = selected.has(o.id)
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => toggle(o.id)}
              className={[
                'w-full rounded-xl border text-left transition',
                'bg-white hover:shadow-sm',
                isSel ? 'border-gray-900 ring-2 ring-gray-900/10' : 'border-gray-200',
              ].join(' ')}
            >
              <div className="flex items-start gap-3 px-3 py-2.5">
                {/* radio/check visual */}
                <span
                  className={[
                    'mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border',
                    isSel ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 text-gray-400',
                  ].join(' ')}
                >
                  {q.type === 'mcq' ? (isSel ? '●' : '') : isSel ? '✓' : ''}
                </span>

                <div className="flex-1">
                  <div className="font-medium leading-6">{o.text || `Option ${o.id}`}</div>
                  <OptionMedia media={(o as any).media} />
                </div>
              </div>
            </button>
          )
        })}
      </div>
    )
  }

  // True/False
  if (q.type === 'boolean') {
    const cur = (v as any).booleanAnswer as boolean
    return (
      <div className="space-y-3">
        <QuestionMedia media={q.media} />

        <div className="flex gap-3">
          <label className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 hover:shadow-sm">
            <input
              type="radio"
              name={`bool-${q.id}`}
              checked={cur === true}
              onChange={() => onChange({ booleanAnswer: true })}
            />
            <span>True</span>
          </label>

          <label className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 hover:shadow-sm">
            <input
              type="radio"
              name={`bool-${q.id}`}
              checked={cur === false}
              onChange={() => onChange({ booleanAnswer: false })}
            />
            <span>False</span>
          </label>
        </div>
      </div>
    )
  }

  // Short text
  return (
    <div className="space-y-3">
      <QuestionMedia media={q.media} />
      <input
        className="h-10 w-full rounded-md border border-gray-300 px-3 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
        placeholder="Type your answer…"
        value={(v as any).textAnswer || ''}
        onChange={(e) => onChange({ textAnswer: e.target.value })}
      />
    </div>
  )
}
