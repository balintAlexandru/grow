/**
 * Shape of `src/content/events/events.json`, written by the `/events-refresh` skill
 * and validated by `npm run events:check`.
 */

export type EventCategoryId = 'bouldering' | 'chess' | 'boardgames' | 'theatre' | 'classical' | 'art' | 'growth' | 'sport'

export type EventSource = 'facebook' | 'instagram' | 'web'

export type GrowEvent = {
  /** `<slug-of-title>-<date>`, stable across runs so the browser cache can merge by it. */
  id: string
  title: string
  categoryId: EventCategoryId
  /** YYYY-MM-DD, first day. */
  date: string
  /** YYYY-MM-DD, last day, only for multi day events (exhibitions, festivals). */
  endDate?: string
  /**
   * Weekly events (a chess night in a pub): the days it repeats on, 0 = Sunday … 6 = Saturday,
   * between `date` and `endDate`. The page shows the next session.
   */
  weekdays?: number[]
  /** HH:MM, local time in the event's city. */
  time?: string
  venue: string
  address?: string
  /** As the organizer writes it: "Gratuit", "60–120 lei". */
  price?: string
  /** 1–2 sentences, in Romanian. */
  description: string
  /** The page the event was confirmed on. */
  url: string
  source: EventSource
  /** Set instead of deleting, so browsers that cached the event learn it was cancelled. */
  cancelled?: boolean
}

export type EventsFile = {
  city: string
  /** YYYY-MM-DD of the last `/events-refresh` run. */
  generatedAt: string
  /** Current month and, near its end, next month. Older events are dropped by `events:check --fix`. */
  events: GrowEvent[]
}
