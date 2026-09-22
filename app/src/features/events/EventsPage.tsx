import { useEffect, useState } from 'react'
import { CalendarDays } from 'lucide-react'
import type { CSSProperties } from 'react'
import GenerateButton from '../../components/GenerateButton/GenerateButton'
import PageHeader from '../../components/PageHeader/PageHeader'
import type { Section } from '../../config/sections'
import EventCard from './EventCard'
import { eventCategories } from './categories'
import { currentMonth, lastDay, loadEvents, nextDate, type EventsState } from './store'
import type { GrowEvent } from './types'
import './events.css'

const FILTER_KEY = 'grow.events.filter'

function readFilter(): string {
  try {
    return localStorage.getItem(FILTER_KEY) ?? ''
  } catch {
    return ''
  }
}

export default function EventsPage({ section }: { section: Section }) {
  const [state, setState] = useState<EventsState | null>(null)
  const [failed, setFailed] = useState(false)
  const [filter, setFilter] = useState(readFilter)

  useEffect(() => {
    let active = true
    loadEvents()
      .then((s) => active && setState(s))
      .catch(() => active && setFailed(true))
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(FILTER_KEY, filter)
    } catch {
      // Remembering the filter is only a convenience.
    }
  }, [filter])

  const { first, last, today } = currentMonth()
  const monthName = new Date().toLocaleDateString('ro-RO', { month: 'long', year: 'numeric' })
  const inMonth = (state?.events ?? []).filter((e) => e.date <= last && lastDay(e) >= first)
  const shown = filter ? inMonth.filter((e) => e.categoryId === filter) : inMonth
  const dated = shown.map((event) => ({ event, next: nextDate(event, today) }))
  const upcoming = dated
    .filter((d): d is { event: GrowEvent; next: string } => d.next !== null)
    .sort((a, b) => a.next.localeCompare(b.next) || (a.event.time ?? '').localeCompare(b.event.time ?? ''))
  const past = dated.filter((d) => d.next === null).map((d) => d.event)
  const newCount = inMonth.filter((e) => state?.newIds.has(e.id)).length

  return (
    <div style={{ '--accent': section.accent } as CSSProperties}>
      <PageHeader
        icon={
          <span className="icon-badge" style={{ width: 52, height: 52 }}>
            <CalendarDays size={26} />
          </span>
        }
        action={<GenerateButton task="events" label="Caută evenimente noi" />}
        eyebrow={section.tagline}
        title={section.label}
        description={`Ce se întâmplă în ${monthName} în București: bouldering, șah, board games, teatru, muzică clasică, artă, dezvoltare personală și sport în grup.`}
      />

      {!state && !failed && <p className="events-hint">Se încarcă evenimentele…</p>}
      {failed && <p className="events-hint">Nu am putut încărca evenimentele. Verifică conexiunea și intră din nou în pagină.</p>}

      {state && (
        <>
          <p className="events-hint">
            Actualizat pe{' '}
            {new Date(state.generatedAt).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })}
            {newCount > 0 && <strong> · {newCount === 1 ? '1 eveniment nou' : `${newCount} evenimente noi`}</strong>}
          </p>

          <div className="events-filters" role="group" aria-label="Filtrează după categorie">
            <button className="chip" aria-pressed={filter === ''} onClick={() => setFilter('')}>
              Toate <span>{inMonth.length}</span>
            </button>
            {eventCategories.map((c) => (
              <button key={c.id} className="chip" aria-pressed={filter === c.id} onClick={() => setFilter(c.id)}>
                {c.emoji} {c.label} <span>{inMonth.filter((e) => e.categoryId === c.id).length}</span>
              </button>
            ))}
          </div>

          {upcoming.length > 0 ? (
            <div className="events-list">
              {upcoming.map(({ event, next }) => (
                <EventCard key={event.id} event={event} next={next} isNew={state.newIds.has(event.id)} />
              ))}
            </div>
          ) : (
            <p className="events-hint">Nu mai urmează evenimente {filter ? 'în categoria asta ' : ''}luna aceasta. Apar după următoarea rulare /events-refresh.</p>
          )}

          {past.length > 0 && (
            <details className="events-past">
              <summary>Au trecut luna aceasta ({past.length})</summary>
              <div className="events-list">
                {past.map((e) => (
                  <EventCard key={e.id} event={e} next={null} isNew={false} />
                ))}
              </div>
            </details>
          )}
        </>
      )}
    </div>
  )
}
