import type { Occasion } from './types'

/** Kept in sync with `.claude/skills/fashion-refresh/SKILL.md` and `scripts/check-fashion.mjs`. */
export const occasions: { id: Occasion; label: string; emoji: string }[] = [
  { id: 'birou', label: 'Birou', emoji: '💻' },
  { id: 'oras', label: 'Ieșit în oraș', emoji: '🌃' },
  { id: 'restaurant', label: 'Restaurant', emoji: '🍽️' },
  { id: 'weekend', label: 'Weekend', emoji: '🎒' },
  { id: 'intalnire', label: 'Întâlnire', emoji: '💬' },
]

export const findOccasion = (id: string) => occasions.find((o) => o.id === id)
