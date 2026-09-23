import { useEffect, useRef, useState } from 'react'
import { ExternalLink, Pause, Play, RotateCcw, X } from 'lucide-react'
import type { PsychologyExercise } from './types'

const mmss = (total: number) => `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`

/** Walks through one exercise, one step at a time; steps with `seconds` advance on their own. */
export default function ExercisePlayer({ exercise, onClose }: { exercise: PsychologyExercise; onClose: () => void }) {
  const [step, setStep] = useState(0)
  const [left, setLeft] = useState(exercise.steps[0]?.seconds ?? 0)
  const [running, setRunning] = useState(false)
  const done = step >= exercise.steps.length
  const current = exercise.steps[step]
  const stepRef = useRef(step)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  useEffect(() => {
    stepRef.current = step
  }, [step])

  useEffect(() => {
    if (!running || done || !current?.seconds) return
    const id = setInterval(() => {
      setLeft((value) => {
        if (value > 1) return value - 1
        const next = stepRef.current + 1
        setStep(next)
        return exercise.steps[next]?.seconds ?? 0
      })
    }, 1000)
    return () => clearInterval(id)
  }, [running, done, current, exercise.steps])

  const go = (index: number) => {
    setStep(index)
    setLeft(exercise.steps[index]?.seconds ?? 0)
  }

  return (
    <div className="reader-backdrop" onClick={onClose}>
      <div className="reader player" role="dialog" aria-modal="true" aria-label={exercise.name} onClick={(e) => e.stopPropagation()}>
        <button className="reader__close" aria-label="Închide exercițiul" onClick={onClose}>
          <X size={20} />
        </button>

        <p className="reader__meta">
          {exercise.forWhat} · {exercise.minutes} min
        </p>
        <h1>{exercise.name}</h1>
        <p className="reader__hook">{exercise.why}</p>

        {done ? (
          <div className="player__done">
            <p>Gata. Observă cum te simți acum, fără să judeci ce vezi.</p>
            <button className="button" onClick={() => go(0)}>
              <RotateCcw size={18} /> Încă o dată
            </button>
          </div>
        ) : (
          <div className="player__stage">
            <p className="player__step">{current?.text}</p>
            {current?.seconds ? (
              <>
                <p className="player__time">{mmss(left)}</p>
                <button className="button" onClick={() => setRunning((r) => !r)}>
                  {running ? <Pause size={18} /> : <Play size={18} />} {running ? 'Pauză' : 'Pornește'}
                </button>
              </>
            ) : (
              <button className="button" onClick={() => go(step + 1)}>
                Am făcut pasul
              </button>
            )}
          </div>
        )}

        <ol className="player__steps">
          {exercise.steps.map((s, i) => (
            <li key={s.text} className={i === step ? 'is-current' : i < step ? 'is-done' : ''}>
              <button onClick={() => go(i)}>
                {s.text}
                {s.seconds ? ` (${mmss(s.seconds)})` : ''}
              </button>
            </li>
          ))}
        </ol>

        <footer className="reader__sources">
          <a href={exercise.source.url} target="_blank" rel="noreferrer">
            {exercise.source.title} <ExternalLink size={13} />
          </a>
        </footer>
      </div>
    </div>
  )
}
