import { useEffect, useRef, useState } from 'react'
import { upsertAnswers } from '@/lib/publicQuizzes.api'

export type AutosaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export default function useAttemptAutosave({
  attemptId,
  answers,
  enabled = true,
  debounceMs = 800,
}: {
  attemptId: string | null
  answers: Array<{ questionId: string; selectedOptionIds?: string[]; booleanAnswer?: boolean; textAnswer?: string }>
  enabled?: boolean
  debounceMs?: number
}) {
  const [status, setStatus] = useState<AutosaveStatus>('idle')
  const [err, setErr] = useState<string | null>(null)
  const lastSaved = useRef<number | null>(null)
  const timer = useRef<number | null>(null)
  const pending = useRef<string>('') // json snapshot

  const flush = async () => {
    if (!enabled || !attemptId) return
    const snapshot = JSON.stringify(answers)
    if (snapshot === pending.current) return
    pending.current = snapshot
    try {
      setStatus('saving')
      setErr(null)
      await upsertAnswers(attemptId, answers)
      lastSaved.current = Date.now()
      setStatus('saved')
    } catch (e: any) {
      setStatus('error')
      setErr(e?.response?.data?.message || 'Autosave failed')
    }
  }

  useEffect(() => {
    if (!enabled || !attemptId) return
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(flush, debounceMs) as any
    return () => { if (timer.current) window.clearTimeout(timer.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(answers), attemptId, enabled])

  useEffect(() => {
    const onUnload = () => { if (status === 'saving') return; flush() }
    window.addEventListener('beforeunload', onUnload)
    return () => window.removeEventListener('beforeunload', onUnload)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, attemptId])

  return {
    status,
    error: err,
    lastSavedAt: lastSaved.current ? new Date(lastSaved.current) : null,
    flush,
  }
}
