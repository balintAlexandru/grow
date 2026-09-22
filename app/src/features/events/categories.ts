import type { EventCategoryId } from './types'

export type EventCategory = { id: EventCategoryId; label: string; emoji: string }

/** Kept in sync with `.claude/skills/events-refresh/SKILL.md` and `scripts/check-events.mjs` (reads the ids from here). */
export const eventCategories: EventCategory[] = [
  { id: 'bouldering', label: 'Bouldering', emoji: '🧗' },
  { id: 'chess', label: 'Șah', emoji: '♟️' },
  { id: 'boardgames', label: 'Board games', emoji: '🎲' },
  { id: 'theatre', label: 'Teatru', emoji: '🎭' },
  { id: 'classical', label: 'Muzică clasică', emoji: '🎻' },
  { id: 'art', label: 'Artă', emoji: '🖼️' },
  { id: 'growth', label: 'Dezvoltare personală', emoji: '🌱' },
  { id: 'sport', label: 'Sport în grup', emoji: '🏃' },
]

export const findEventCategory = (id: string) => eventCategories.find((c) => c.id === id)
