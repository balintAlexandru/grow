/**
 * Shape of `src/content/psychology/guide.json`, written by the `/psychology-refresh` skill
 * and validated by `npm run psychology:check`. The journal is not here: it lives in the repo,
 * written through `/api/journal` (spec 0008).
 */

export type PsychologyArticle = {
  id: string
  /** One of the ids in `topics.ts`. */
  topicId: string
  title: string
  hook: string
  /** The whole article in one sentence. */
  coreIdea: string
  sections: { heading: string; body: string }[]
  /** Exactly 3. */
  takeaways: string[]
  /** One small thing to do today. */
  tryToday: string
  sources: { title: string; url: string }[]
  readingMinutes: number
}

export type PsychologyExercise = {
  id: string
  name: string
  /** What it is for: „anxietate”, „furie”, „somn”, „focus”, „stimă de sine”. */
  forWhat: string
  /** Why it works, one or two sentences, with the mechanism. */
  why: string
  /** Steps, in order; the timer runs one step at a time. */
  steps: { text: string; seconds?: number }[]
  /** Total minutes, as a hint before starting. */
  minutes: number
  source: { title: string; url: string }
}

export type PsychologyGuide = {
  /** YYYY-MM-DD of the last `/psychology-refresh` run. */
  generatedAt: string
  articles: PsychologyArticle[]
  exercises: PsychologyExercise[]
}
