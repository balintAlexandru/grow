import { useCallback, useState } from 'react'

/** Missions marked done, as lesson id → YYYY-MM-DD. Kept in this browser only (feature 10 decides real persistence). */
const DONE_KEY = 'grow.learning.done'

type DoneMap = Record<string, string>

const pad = (n: number) => String(n).padStart(2, '0')
const dateKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

function readDone(): DoneMap {
  try {
    const value = JSON.parse(localStorage.getItem(DONE_KEY) ?? '{}')
    return value && typeof value === 'object' ? value : {}
  } catch {
    return {}
  }
}

/** Monday of the current week, as YYYY-MM-DD. */
function weekStart() {
  const now = new Date()
  return dateKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7)))
}

export function useDone() {
  const [done, setDone] = useState(readDone)

  const toggle = useCallback((lessonId: string) => {
    setDone((current) => {
      const next = { ...current }
      if (next[lessonId]) delete next[lessonId]
      else next[lessonId] = dateKey(new Date())
      try {
        localStorage.setItem(DONE_KEY, JSON.stringify(next))
      } catch {
        // Without storage the tick lasts until the page is closed.
      }
      return next
    })
  }, [])

  const monday = weekStart()
  const doneThisWeek = Object.values(done).filter((day) => day >= monday).length

  return { isDone: (id: string) => Boolean(done[id]), toggle, doneThisWeek }
}
