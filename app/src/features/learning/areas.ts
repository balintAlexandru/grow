export type LearningArea = { id: string; label: string; emoji: string }

/**
 * Built from the owner's answers (spec 0005): a frontend developer becoming an AI engineer on applications,
 * who wants to grow as a whole person and whose main blocker is shyness.
 * Kept in sync with `.claude/skills/learning-daily/SKILL.md` and `scripts/check-content.mjs` (reads the ids from here).
 */
export const learningAreas: LearningArea[] = [
  { id: 'social', label: 'Conversații și încredere', emoji: '💬' },
  { id: 'ai-engineer', label: 'Drumul spre AI engineer', emoji: '🛠️' },
  { id: 'body', label: 'Forță și cardio', emoji: '🏋️' },
  { id: 'nutrition', label: 'Nutriție pe bază de dovezi', emoji: '🥗' },
  { id: 'mind', label: 'Obiceiuri, focus și emoții', emoji: '🧠' },
  { id: 'money', label: 'Bani și carieră', emoji: '💰' },
  { id: 'ai-news', label: 'Noutăți din AI', emoji: '🗞️' },
]

export const findLearningArea = (id: string) => learningAreas.find((a) => a.id === id)

/**
 * The social area's exposure ladder: each daily mission is one small step up, never a jump.
 * A lesson's `step` is the rung it trains.
 */
export const socialSteps = [
  'Contact vizual și un zâmbet',
  'Small talk scurt: o replică la casă sau la cafenea',
  'O întrebare pusă unui necunoscut',
  'O conversație de 2–3 minute cu cineva nou',
  'Intri într-un grup la un eveniment',
  'Propui să vă revedeți',
]
