import { useCallback, useEffect, useState } from 'react'

/**
 * The journal is kept in the private repo through `/api/journal` (spec 0008), so it survives deploys and
 * shows up on every device. What he writes is saved in this browser first and only then sent, so a failed
 * request never loses text: unsent entries stay queued and go up on the next save or page load.
 */
export type JournalEntry = {
  id: string
  /** YYYY-MM-DD */
  date: string
  /** 1 (foarte prost) … 5 (foarte bine) */
  mood: number
  gratitude: string[]
  note: string
  updatedAt: string
}

const CACHE_KEY = 'grow.psychology.journal'
const QUEUE_KEY = 'grow.psychology.journal.pending'

export type SyncState = 'idle' | 'saving' | 'saved' | 'offline' | 'error'

const read = <T,>(key: string, fallback: T): T => {
  try {
    const value = JSON.parse(localStorage.getItem(key) ?? 'null')
    return value ?? fallback
  } catch {
    return fallback
  }
}
const write = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage full or blocked: the entry still goes to the repo.
  }
}

const byDate = (a: JournalEntry, b: JournalEntry) => b.date.localeCompare(a.date) || b.updatedAt.localeCompare(a.updatedAt)
const merge = (a: JournalEntry[], b: JournalEntry[]) => {
  const map = new Map(a.map((e) => [e.id, e]))
  for (const entry of b) {
    const existing = map.get(entry.id)
    if (!existing || entry.updatedAt > existing.updatedAt) map.set(entry.id, entry)
  }
  return [...map.values()].sort(byDate)
}

const monthOf = (date: string) => date.slice(0, 7)
const pad = (n: number) => String(n).padStart(2, '0')
export const todayKey = () => {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

async function push(entry: JournalEntry) {
  const res = await fetch('/api/journal', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(entry) })
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(data.error ?? `Eroare ${res.status}`)
  }
}

export function useJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>(() => read<JournalEntry[]>(CACHE_KEY, []))
  const [state, setState] = useState<SyncState>('idle')

  const store = useCallback((next: JournalEntry[]) => {
    setEntries(next)
    write(CACHE_KEY, next)
  }, [])

  /** Sends anything that has not reached the repo yet. */
  const flush = useCallback(async () => {
    const pending = read<JournalEntry[]>(QUEUE_KEY, [])
    if (pending.length === 0) return true
    const left: JournalEntry[] = []
    for (const entry of pending) {
      try {
        await push(entry)
      } catch {
        left.push(entry)
      }
    }
    write(QUEUE_KEY, left)
    return left.length === 0
  }, [])

  // On open: send what is queued, then read this month and the one before from the repo.
  useEffect(() => {
    if (import.meta.env.DEV) return
    let active = true
    const load = async () => {
      const sent = await flush()
      const now = new Date()
      const previous = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const months = [`${now.getFullYear()}-${pad(now.getMonth() + 1)}`, `${previous.getFullYear()}-${pad(previous.getMonth() + 1)}`]
      try {
        const fetched: JournalEntry[] = []
        for (const month of months) {
          const res = await fetch(`/api/journal?month=${month}`, { cache: 'no-store' })
          if (!res.ok) continue
          const data = (await res.json()) as { entries?: JournalEntry[] }
          fetched.push(...(data.entries ?? []))
        }
        if (!active) return
        const merged = merge(read<JournalEntry[]>(CACHE_KEY, []), fetched)
        store(merged)
        setState(sent ? 'idle' : 'offline')
      } catch {
        if (active) setState('offline')
      }
    }
    void load()
    return () => {
      active = false
    }
  }, [flush, store])

  const save = useCallback(
    async (draft: Omit<JournalEntry, 'updatedAt'>) => {
      const entry: JournalEntry = { ...draft, updatedAt: new Date().toISOString() }
      store(merge(read<JournalEntry[]>(CACHE_KEY, []), [entry]))
      setState('saving')
      try {
        await push(entry)
        setState('saved')
      } catch {
        // Keep it for the next attempt; it is already safe in this browser.
        write(QUEUE_KEY, [...read<JournalEntry[]>(QUEUE_KEY, []).filter((e) => e.id !== entry.id), entry])
        setState('offline')
      }
    },
    [store],
  )

  const remove = useCallback(
    async (entry: JournalEntry) => {
      store(read<JournalEntry[]>(CACHE_KEY, []).filter((e) => e.id !== entry.id))
      write(QUEUE_KEY, read<JournalEntry[]>(QUEUE_KEY, []).filter((e) => e.id !== entry.id))
      try {
        await fetch(`/api/journal?id=${encodeURIComponent(entry.id)}&month=${monthOf(entry.date)}`, { method: 'DELETE' })
      } catch {
        setState('error')
      }
    },
    [store],
  )

  const entryFor = useCallback((date: string) => entries.find((e) => e.date === date), [entries])

  return { entries, state, save, remove, entryFor }
}
