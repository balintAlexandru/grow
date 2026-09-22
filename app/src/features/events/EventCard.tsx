import { Clock, ExternalLink, MapPin, Ticket } from 'lucide-react'
import { findEventCategory } from './categories'
import { lastDay } from './store'
import type { GrowEvent } from './types'

const SOURCE_LABEL = { facebook: 'Facebook', instagram: 'Instagram', web: 'site' } as const

const parse = (key: string) => {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}
const shortDate = (key: string) => parse(key).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' })

const WEEKDAYS = ['duminică', 'luni', 'marți', 'miercuri', 'joi', 'vineri', 'sâmbătă']
const listRo = (items: string[]) => (items.length > 1 ? `${items.slice(0, -1).join(', ')} și ${items.at(-1)}` : items[0])
/** "În fiecare marți și joi", Monday first. */
const weeklyLabel = (days: number[]) => `În fiecare ${listRo([...days].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7)).map((d) => WEEKDAYS[d]))}`

type EventCardProps = {
  event: GrowEvent
  /** Next day it happens (see `nextDate`), null when it is over. */
  next: string | null
  isNew: boolean
}

export default function EventCard({ event, next, isNew }: EventCardProps) {
  const category = findEventCategory(event.categoryId)
  const isPast = next === null
  const weekly = Boolean(event.weekdays?.length)
  // A running exhibition shows when it ends; a weekly event shows its next session.
  const ongoing = !isPast && !weekly && event.date < next
  const shown = parse(isPast ? event.date : ongoing ? lastDay(event) : next)
  const className = ['event-card', isPast && 'event-card--past', event.cancelled && 'event-card--cancelled'].filter(Boolean).join(' ')

  return (
    <article className={className}>
      <div className="event-card__date" aria-hidden="true">
        <span className="event-card__weekday">{ongoing ? 'până la' : shown.toLocaleDateString('ro-RO', { weekday: 'short' })}</span>
        <span className="event-card__day">{shown.getDate()}</span>
        <span className="event-card__month">{shown.toLocaleDateString('ro-RO', { month: 'short' })}</span>
      </div>

      <div className="event-card__body">
        <div className="event-card__tags">
          {category && (
            <span className="event-tag">
              {category.emoji} {category.label}
            </span>
          )}
          {isNew && <span className="event-tag event-tag--new">Nou</span>}
          {event.cancelled && <span className="event-tag event-tag--cancelled">Anulat</span>}
        </div>

        <h3>{event.title}</h3>

        <ul className="event-card__meta">
          <li>
            <Clock size={15} />
            {weekly && event.weekdays
              ? `${weeklyLabel(event.weekdays)}, până la ${shortDate(lastDay(event))}`
              : event.endDate
                ? `${shortDate(event.date)} – ${shortDate(event.endDate)}`
                : shortDate(event.date)}
            {event.time && `, ${event.time}`}
          </li>
          <li>
            <MapPin size={15} />
            {event.venue}
            {event.address && <span className="event-card__address"> · {event.address}</span>}
          </li>
          {event.price && (
            <li>
              <Ticket size={15} />
              {event.price}
            </li>
          )}
        </ul>

        <p className="event-card__description">{event.description}</p>

        <a className="event-card__link" href={event.url} target="_blank" rel="noreferrer">
          Vezi pe {SOURCE_LABEL[event.source] ?? 'site'} <ExternalLink size={14} />
        </a>
      </div>
    </article>
  )
}
