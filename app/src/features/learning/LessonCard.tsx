import { Check, Clock, PlayCircle, Target } from 'lucide-react'
import { findLearningArea } from './areas'
import type { Lesson } from './types'

export default function LessonCard({ lesson, done, onOpen }: { lesson: Lesson; done: boolean; onOpen: () => void }) {
  const area = findLearningArea(lesson.areaId)

  return (
    <button className={done ? 'article-card article-card--done' : 'article-card'} onClick={onOpen}>
      {area && (
        <span className="article-card__area">
          {area.emoji} {area.label}
        </span>
      )}
      <h3>{lesson.title}</h3>
      <p className="article-card__hook">{lesson.hook}</p>
      <p className="article-card__mission">
        {done ? <Check size={15} /> : <Target size={15} />}
        <span className="article-card__mission-text">{done ? 'Misiune făcută' : lesson.tryToday}</span>
      </p>
      <span className="article-card__meta">
        <span>
          <Clock size={14} /> {lesson.readingMinutes} min
        </span>
        {lesson.videos.length > 0 && (
          <span>
            <PlayCircle size={14} /> video
          </span>
        )}
      </span>
    </button>
  )
}
