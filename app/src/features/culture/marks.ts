import { useCallback, useEffect, useState } from 'react'
import type { CultureMarks } from './types'

/**
 * What he wants to see and what he already did, kept in `data/culture.json` in the repo through
 * `/api/store` (spec 0009). Same rule as the journal: the browser first, the repo right after,
 * so a failed request never loses a mark.
 */
const KEY = 'grow.culture.marks'

const read = (): CultureMarks => {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) ?? '{}')
    return value && typeof value === 'object' ? value : {}
  } catch {
    return {}
  }
}
const write = (marks: CultureMarks) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(marks))
  } catch {
    // Without storage the marks last until the page is closed; the repo still gets them.
  }
}

export type MarksState = 'idle' | 'saving' | 'saved' | 'offline'

export function useCultureMarks() {
  const [marks, setMarks] = useState<CultureMarks>(read)
  const [state, setState] = useState<MarksState>('idle')

  // The repo copy wins for ids this browser has never seen; local changes stay on top.
  useEffect(() => {
    if (import.meta.env.DEV) return
    let active = true
    fetch('/api/store?key=culture', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { value?: CultureMarks } | null) => {
        if (!active || !data?.value) return
        const merged = { ...data.value, ...read() }
        setMarks(merged)
        write(merged)
      })
      .catch(() => {
        if (active) setState('offline')
      })
    return () => {
      active = false
    }
  }, [])

  const toggle = useCallback(async (id: string, value: 'vreau' | 'facut') => {
    const next = { ...read() }
    if (next[id] === value) delete next[id]
    else next[id] = value
    setMarks(next)
    write(next)
    setState('saving')
    try {
      const res = await fetch('/api/store?key=culture', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next),
      })
      setState(res.ok ? 'saved' : 'offline')
    } catch {
      setState('offline')
    }
  }, [])

  return { marks, state, toggle }
}
