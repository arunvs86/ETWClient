import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

type Val = string | number | boolean | undefined

export function useSearchState<T extends Record<string, Val>>(defaults: T) {
  const [sp, setSp] = useSearchParams()

  const state = useMemo(() => {
    const obj: Record<string, Val> = { ...defaults }
    for (const [k, v] of sp.entries()) {
      if (v === 'true' || v === 'false') obj[k] = v === 'true'
      else if (!Number.isNaN(Number(v)) && /^-?\d+(\.\d+)?$/.test(v)) obj[k] = Number(v)
      else obj[k] = v
    }
    return obj as T
  }, [sp, defaults])

  const update = useCallback((patch: Partial<T>, resetPage = true) => {
    const next = new URLSearchParams(sp)
    Object.entries(patch).forEach(([k, v]) => {
      if (v === undefined || v === '' || v === null) next.delete(k)
      else next.set(k, String(v))
    })
    if (resetPage) next.set('page', '1')
    setSp(next, { replace: true })
  }, [sp, setSp])

  return { state, update }
}
