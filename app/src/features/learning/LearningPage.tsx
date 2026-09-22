import { useCallback, useEffect, useState } from 'react'
import { GraduationCap } from 'lucide-react'
import type { CSSProperties } from 'react'
import GenerateButton from '../../components/GenerateButton/GenerateButton'
import PageHeader from '../../components/PageHeader/PageHeader'
import type { Section } from '../../config/sections'
import LessonCard from './LessonCard'
import LessonReader from './LessonReader'
import { learningAreas, socialSteps } from './areas'
import { currentSocialStep, learningDays, lessonsInArea } from './content'
import { useDone } from './done'
import type { Lesson } from './types'
import './learning.css'

const AREA_KEY = 'grow.learning.area'

function readArea(): string {
  try {
    return localStorage.getItem(AREA_KEY) ?? learningAreas[0].id
  } catch {
    return learningAreas[0].id
  }
}

const pad = (n: number) => String(n).padStart(2, '0')
const today = () => {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
const longDate = (key: string) => new Date(`${key}T12:00:00`).toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long' })

export default function LearningPage({ section }: { section: Section }) {
  const [areaId, setAreaId] = useState(readArea)
  const [open, setOpen] = useState<Lesson | null>(null)
  const close = useCallback(() => setOpen(null), [])
  const { isDone, toggle, doneThisWeek } = useDone()

  useEffect(() => {
    try {
      localStorage.setItem(AREA_KEY, areaId)
    } catch {
      // Remembering the area is only a convenience.
    }
  }, [areaId])

  const day = learningDays[0]
  const minutes = day?.lessons.reduce((sum, l) => sum + l.readingMinutes, 0) ?? 0
  const step = currentSocialStep()
  const inArea = lessonsInArea(areaId)

  return (
    <div style={{ '--accent': section.accent } as CSSProperties}>
      <PageHeader
        icon={
          <span className="icon-badge" style={{ width: 52, height: 52 }}>
            <GraduationCap size={26} />
          </span>
        }
        action={<GenerateButton task="learning" label="Generează lecțiile de azi" />}
        eyebrow={section.tagline}
        title={section.label}
        description="10–15 minute pe zi: 3 lecții scurte, fiecare cu o misiune concretă. Încredere în conversații, drumul spre AI engineer și, pe rând, sport, nutriție, minte și bani."
      />

      <div className="learning-stats">
        <span>
          <strong>{doneThisWeek}</strong> {doneThisWeek === 1 ? 'misiune făcută' : 'misiuni făcute'} săptămâna asta
        </span>
        {step && (
          <span>
            💬 Încredere socială: <strong>treapta {step} din {socialSteps.length}</strong>, {socialSteps[step - 1].toLowerCase()}
          </span>
        )}
      </div>

      <h2 className="learning-heading">Planul de azi</h2>
      {!day && <p className="learning-hint">Planul apare după prima rulare /learning-daily.</p>}
      {day && (
        <>
          <p className="learning-hint">
            {day.date === today()
              ? `${longDate(day.date)} · ${day.lessons.length} lecții · cam ${minutes} min de citit, plus misiunile`
              : `Planul de azi apare după următoarea rulare /learning-daily. Până atunci, cel din ${longDate(day.date)}.`}
          </p>
          <div className="card-grid">
            {day.lessons.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} done={isDone(lesson.id)} onOpen={() => setOpen(lesson)} />
            ))}
          </div>
        </>
      )}

      <h2 className="learning-heading">Explorează pe arii</h2>
      <div className="learning-areas" role="group" aria-label="Alege o arie">
        {learningAreas.map((a) => (
          <button key={a.id} className="chip" aria-pressed={areaId === a.id} onClick={() => setAreaId(a.id)}>
            {a.emoji} {a.label} <span>{lessonsInArea(a.id).length}</span>
          </button>
        ))}
      </div>
      {inArea.length > 0 ? (
        <div className="card-grid">
          {inArea.map((lesson) => (
            <LessonCard key={lesson.id} lesson={lesson} done={isDone(lesson.id)} onOpen={() => setOpen(lesson)} />
          ))}
        </div>
      ) : (
        <p className="learning-hint">Încă nu sunt lecții aici. Aria intră în rotație în zilele următoare.</p>
      )}

      {open && <LessonReader lesson={open} done={isDone(open.id)} onToggleDone={() => toggle(open.id)} onClose={close} />}
    </div>
  )
}
