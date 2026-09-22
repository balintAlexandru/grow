import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, Check, CheckCircle2, ExternalLink, Lightbulb, Sparkles, Target, X } from 'lucide-react'
import { findLearningArea, socialSteps } from './areas'
import type { Lesson } from './types'

type LessonReaderProps = { lesson: Lesson; done: boolean; onToggleDone: () => void; onClose: () => void }

export default function LessonReader({ lesson, done, onToggleDone, onClose }: LessonReaderProps) {
  const area = findLearningArea(lesson.areaId)
  const [showAnswer, setShowAnswer] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div className="reader-backdrop" onClick={onClose}>
      <article className="reader" role="dialog" aria-modal="true" aria-label={lesson.title} onClick={(e) => e.stopPropagation()}>
        <button className="reader__close" aria-label="Închide lecția" onClick={onClose} autoFocus>
          <X size={20} />
        </button>

        <p className="reader__meta">
          {area && `${area.emoji} ${area.label} · `}
          {lesson.readingMinutes} min de citit
        </p>
        <h1>{lesson.title}</h1>
        <p className="reader__hook">{lesson.hook}</p>

        <div className="reader__box reader__box--core">
          <strong>
            <Sparkles size={16} /> Ideea pe scurt
          </strong>
          <p>{lesson.coreIdea}</p>
        </div>

        {lesson.sections.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            <p>{section.body}</p>
            {section.code && (
              <pre className="reader__code">
                <code>{section.code}</code>
              </pre>
            )}
          </section>
        ))}

        <div className="reader__box">
          <strong>
            <Lightbulb size={16} /> Exemplu
          </strong>
          <p>{lesson.example}</p>
        </div>

        {lesson.videos.map((video) => (
          <figure key={video.videoId} className="reader__video">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${video.videoId}`}
              title={video.title}
              loading="lazy"
              allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            <figcaption>
              {video.title}
              {video.channel && <span> · {video.channel}</span>}
            </figcaption>
          </figure>
        ))}

        <h2>De reținut</h2>
        <ul className="reader__takeaways">
          {lesson.takeaways.map((takeaway) => (
            <li key={takeaway}>
              <CheckCircle2 size={18} />
              {takeaway}
            </li>
          ))}
        </ul>

        <div className="reader__box reader__box--action">
          <strong>
            <Target size={16} /> Misiunea de azi
          </strong>
          {lesson.step && (
            <p className="reader__step">
              Treapta {lesson.step} din {socialSteps.length}: {socialSteps[lesson.step - 1]}
            </p>
          )}
          <p>{lesson.tryToday}</p>
          {lesson.eventTitle && (
            <Link className="reader__event" to="/evenimente">
              <CalendarDays size={15} /> {lesson.eventTitle}, în Evenimente
            </Link>
          )}
          <button className={done ? 'button reader__done reader__done--on' : 'button reader__done'} aria-pressed={done} onClick={onToggleDone}>
            <Check size={16} /> {done ? 'Făcut' : 'Am făcut-o'}
          </button>
        </div>

        <div className="reader__quiz">
          <strong>Verifică-te</strong>
          <p>{lesson.quiz.question}</p>
          {showAnswer ? (
            <p className="reader__answer">{lesson.quiz.answer}</p>
          ) : (
            <button className="button button--ghost" onClick={() => setShowAnswer(true)}>
              Arată răspunsul
            </button>
          )}
        </div>

        {lesson.sources.length > 0 && (
          <footer className="reader__sources">
            <strong>Surse</strong>
            {lesson.sources.map((source) => (
              <a key={source.url} href={source.url} target="_blank" rel="noreferrer">
                {source.title} <ExternalLink size={13} />
              </a>
            ))}
          </footer>
        )}
      </article>
    </div>
  )
}
