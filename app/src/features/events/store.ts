import eventsUrl from '../../content/events/events.json?url'
import type { EventsFile, GrowEvent } from './types'

/**
 * Loads events at most once per new version of `events.json`, and keeps what was already seen.
 *
 * The build puts a content hash in the file's url, so the url is the version: while the cached
 * version matches, nothing is requested. A new version is fetched once and merged into the cache
 * by id: new events are added (and marked new), changed ones updated, and ones that vanished from
 * the file stay until their month is over. In dev the url never changes, so each page load checks once.
 */
const VERSION = import.meta.env.DEV ? `dev:${Date.now()}` : eventsUrl
const CACHE_KEY = 'grow.events'

type Cache = {
  version: string
  generatedAt: string
  events: GrowEvent[]
  /** Ids added by the last update, shown as "Nou" until the next one. */
  newIds: string[]
}

export type EventsState = { events: GrowEvent[]; newIds: Set<string>; generatedAt: string }

const pad = (n: number) => String(n).padStart(2, '0')
/** Local YYYY-MM-DD, comparable as a string. */
export const toDateKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export function currentMonth(now = new Date()) {
  const first = toDateKey(new Date(now.getFullYear(), now.getMonth(), 1))
  const last = toDateKey(new Date(now.getFullYear(), now.getMonth() + 1, 0))
  return { first, last, today: toDateKey(now) }
}

export const lastDay = (e: GrowEvent) => e.endDate ?? e.date

/**
 * The day this event next happens, from `today` on, or null when it is over.
 * Multi day events count as happening today while they run; weekly ones return their next session.
 */
export function nextDate(e: GrowEvent, today: string): string | null {
  if (lastDay(e) < today) return null
  if (e.date >= today || !e.weekdays?.length) return e.date >= today ? e.date : today
  const [y, m, d] = today.split('-').map(Number)
  for (let i = 0; i < 7; i++) {
    const day = new Date(y, m - 1, d + i)
    const key = toDateKey(day)
    if (key > lastDay(e)) return null
    if (e.weekdays.includes(day.getDay())) return key
  }
  return null
}

/** Events from past months are dropped; this and later months are kept. */
const notOver = (e: GrowEvent) => lastDay(e) >= currentMonth().first

const byDate = (a: GrowEvent, b: GrowEvent) => a.date.localeCompare(b.date) || (a.time ?? '').localeCompare(b.time ?? '')

function readCache(): Cache | null {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) ?? 'null') as Cache | null
    return cache && typeof cache.version === 'string' && Array.isArray(cache.events) ? cache : null
  } catch {
    return null
  }
}

function writeCache(cache: Cache) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch {
    // Without storage the page still works; it just fetches again next time.
  }
}

const toState = (cache: Cache): EventsState => ({
  events: cache.events.filter(notOver).sort(byDate),
  newIds: new Set(cache.newIds ?? []),
  generatedAt: cache.generatedAt,
})

async function fetchFile(): Promise<EventsFile> {
  const res = await fetch(eventsUrl)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const file = (await res.json()) as EventsFile
  if (!Array.isArray(file.events)) throw new Error('events.json fără listă de evenimente')
  return file
}

async function sync(): Promise<EventsState> {
  const cache = readCache()
  if (cache?.version === VERSION) return toState(cache)

  let file: EventsFile
  try {
    file = await fetchFile()
  } catch (error) {
    if (cache) return toState(cache) // offline: show what we have, try again next visit
    throw error
  }

  const kept = (cache?.events ?? []).filter(notOver)
  const known = new Set(kept.map((e) => e.id))
  const merged = new Map(kept.map((e) => [e.id, e]))
  for (const event of file.events) if (notOver(event)) merged.set(event.id, event)

  const next: Cache = {
    version: VERSION,
    generatedAt: file.generatedAt,
    events: [...merged.values()],
    // On the very first load everything is new, so nothing is highlighted.
    newIds: cache ? [...merged.keys()].filter((id) => !known.has(id)) : [],
  }
  writeCache(next)
  return toState(next)
}

let pending: Promise<EventsState> | null = null

/** Concurrent calls (e.g. React StrictMode's double effect) share one request. */
export function loadEvents(): Promise<EventsState> {
  pending ??= sync().finally(() => {
    pending = null
  })
  return pending
}
