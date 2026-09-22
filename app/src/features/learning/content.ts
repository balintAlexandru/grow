import type { LearningDay, LearningLibrary, Lesson } from './types'

const dayFiles = import.meta.glob<LearningDay>('../../content/learning/days/*.json', { eager: true, import: 'default' })
const libraryFile = import.meta.glob<LearningLibrary>('../../content/learning/library.json', { eager: true, import: 'default' })

/** Newest first. */
export const learningDays = Object.values(dayFiles).sort((a, b) => b.date.localeCompare(a.date))

/** Every lesson, newest first, then the library. */
export const allLessons: Lesson[] = [...learningDays.flatMap((d) => d.lessons), ...Object.values(libraryFile).flatMap((l) => l.lessons)]

export const lessonsInArea = (areaId: string) => allLessons.filter((l) => l.areaId === areaId)

/** The rung of the social ladder the latest social mission trained. */
export const currentSocialStep = () => allLessons.find((l) => l.areaId === 'social' && l.step)?.step
