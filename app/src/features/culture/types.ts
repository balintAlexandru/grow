/**
 * Shape of `src/content/culture/guide.json`, written by the `/culture-refresh` skill
 * and validated by `npm run culture:check`. What the owner marks is not here: it goes to
 * `data/culture.json` in the repo, through `/api/store` (spec 0009).
 */

export type CultureKind = 'film' | 'carte' | 'album' | 'documentar' | 'podcast'

export type Recommendation = {
  id: string
  kind: CultureKind
  title: string
  /** Director, author, band; and the year. */
  author: string
  year: number
  /** Why it is worth his time, in one or two sentences. */
  why: string
  /** What to say about it in a conversation: the hook that makes it interesting. */
  talkingPoint: string
  /** Running time or length: „1h 53min”, „320 de pagini”. */
  length: string
  /** Where to find it: streaming service, library, shop. */
  whereToFind: string
  /** A page about it (festival, publisher, museum, official site). */
  url: string
}

export type CultureStory = {
  id: string
  title: string
  /** The story itself, 120–220 words, true and checkable. */
  body: string
  /** How to tell it in 30 seconds. */
  tellIt: string
  sources: { title: string; url: string }[]
}

export type CulturePlace = {
  id: string
  name: string
  /** „muzeu”, „cinema”, „librărie”, „sală de concert”, „galerie”. */
  kind: string
  address: string
  /** What it is and why to go. */
  what: string
  /** Practical: opening hours, price, free day, when known. */
  practical?: string
  url: string
}

export type CultureGuide = {
  /** YYYY-MM-DD of the last `/culture-refresh` run. */
  generatedAt: string
  recommendations: Recommendation[]
  stories: CultureStory[]
  places: CulturePlace[]
}

/** What he marked, kept in the repo: recommendation or place id → state. */
export type CultureMarks = Record<string, 'vreau' | 'facut'>
