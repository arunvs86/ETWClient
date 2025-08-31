import { useEffect, useMemo, useState } from 'react'

function fmt(sec: number) {
  const s = Math.max(0, Math.floor(sec))
  const hh = Math.floor(s / 3600)
  const mm = Math.floor((s % 3600) / 60)
  const ss = s % 60
  return hh > 0
    ? `${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')}`
    : `${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')}`
}

export default function QuizTimer({
  startedAt,
  timeLimitSec,
  expiresAt,
  onExpire,
}: {
  startedAt: string
  timeLimitSec: number
  expiresAt: string | null
  onExpire?: () => void
}) {
  const endTs = useMemo(() => {
    if (!timeLimitSec) return null
    if (expiresAt) return new Date(expiresAt).getTime()
    return new Date(startedAt).getTime() + timeLimitSec * 1000
  }, [startedAt, timeLimitSec, expiresAt])

  const [now, setNow] = useState<number>(() => Date.now())

  useEffect(() => {
    if (!endTs) return
    const t = setInterval(() => setNow(Date.now()), 500)
    return () => clearInterval(t)
  }, [endTs])

  useEffect(() => {
    if (!endTs) return
    if (now >= endTs) onExpire?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now, endTs])

  if (!timeLimitSec || !endTs) return null

  const remaining = Math.max(0, Math.floor((endTs - now) / 1000))
  const danger = remaining <= 30

  return (
    <div className={`rounded-lg px-3 py-1 text-sm ${danger ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-800'}`}>
      ⏱ Time left: <span className="font-semibold">{fmt(remaining)}</span>
    </div>
  )
}
