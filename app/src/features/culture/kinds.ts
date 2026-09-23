import type { CultureKind } from './types'

/** Kept in sync with `.claude/skills/culture-refresh/SKILL.md` and `scripts/check-culture.mjs`. */
export const cultureKinds: { id: CultureKind; label: string; emoji: string }[] = [
  { id: 'film', label: 'Filme', emoji: '🎬' },
  { id: 'carte', label: 'Cărți', emoji: '📕' },
  { id: 'album', label: 'Muzică', emoji: '🎧' },
  { id: 'documentar', label: 'Documentare', emoji: '🎥' },
  { id: 'podcast', label: 'Podcasturi', emoji: '🎙️' },
]

export const findKind = (id: string) => cultureKinds.find((k) => k.id === id)
