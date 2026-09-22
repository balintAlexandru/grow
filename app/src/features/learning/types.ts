/**
 * Shape of `src/content/learning/days/<date>.json` and `library.json`, written by the `/learning-daily` skill
 * and validated by `npm run content:check`.
 */

export type LessonSection = {
  heading: string
  body: string
  /** Optional short code example (technical areas), shown as a code block. */
  code?: string
}

export type LessonVideo = { videoId: string; title: string; channel: string }

export type LessonSource = { title: string; url: string }

export type Lesson = {
  id: string
  areaId: string
  title: string
  /** A question or surprising fact that opens the lesson. */
  hook: string
  /** The whole lesson in one plain sentence. */
  coreIdea: string
  sections: LessonSection[]
  example: string
  takeaways: string[]
  /** Today's mission: one small, concrete action. */
  tryToday: string
  quiz: { question: string; answer: string }
  videos: LessonVideo[]
  sources: LessonSource[]
  readingMinutes: number
  /** Social area only: the rung of `socialSteps` (1-based) this mission trains. */
  step?: number
  /** Set when the mission happens at an event from the Evenimente page. */
  eventTitle?: string
}

/** One day's plan: 3 lessons, 10–15 minutes in total. */
export type LearningDay = {
  date: string
  /** 2+ when the plan was replaced from the site's button; the old lessons moved to the library. */
  version?: number
  lessons: Lesson[]
}

/** Evergreen lessons kept from before the daily plan, browsable by area. */
export type LearningLibrary = { lessons: Lesson[] }
