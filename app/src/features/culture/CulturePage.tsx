import { useState } from 'react'
import { BookmarkPlus, Check, Cloud, CloudOff, ExternalLink, Landmark, Loader2, MapPin, MessageCircle } from 'lucide-react'
import type { CSSProperties } from 'react'
import GenerateButton from '../../components/GenerateButton/GenerateButton'
import PageHeader from '../../components/PageHeader/PageHeader'
import type { Section } from '../../config/sections'
import guide from '../../content/culture/guide.json'
import { cultureKinds, findKind } from './kinds'
import { useCultureMarks } from './marks'
import type { CultureGuide, CultureStory, Recommendation } from './types'
import './culture.css'

const culture = guide as CultureGuide

const TABS = [
  { id: 'recomandari', label: 'De văzut și citit', emoji: '🎬' },
  { id: 'povesti', label: 'Povești de spus', emoji: '💬' },
  { id: 'locuri', label: 'Locuri în București', emoji: '📍' },
  { id: 'lista', label: 'Lista mea', emoji: '⭐' },
] as const

export default function CulturePage({ section }: { section: Section }) {
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('recomandari')
  const [kind, setKind] = useState('')
  const [openStory, setOpenStory] = useState<CultureStory | null>(null)
  const { marks, state, toggle } = useCultureMarks()

  const shown = kind ? culture.recommendations.filter((r) => r.kind === kind) : culture.recommendations
  const mine = [...culture.recommendations.filter((r) => marks[r.id]), ...culture.places.filter((p) => marks[p.id])]

  const Card = ({ item }: { item: Recommendation }) => {
    const k = findKind(item.kind)
    const mark = marks[item.id]
    return (
      <article className="culture-card">
        <span className="fashion-card__layer">
          {k?.emoji} {k?.label}
        </span>
        <h3>{item.title}</h3>
        <p className="culture-card__meta">
          {item.author} · {item.year} · {item.length}
        </p>
        <p>{item.why}</p>
        <p className="culture-card__talk">
          <MessageCircle size={15} /> <span>{item.talkingPoint}</span>
        </p>
        <p className="culture-card__where">{item.whereToFind}</p>
        <div className="fashion-card__actions">
          <button className="button button--ghost" aria-pressed={mark === 'vreau'} onClick={() => void toggle(item.id, 'vreau')}>
            <BookmarkPlus size={16} /> {mark === 'vreau' ? 'În listă' : 'Vreau'}
          </button>
          <button className="button button--ghost" aria-pressed={mark === 'facut'} onClick={() => void toggle(item.id, 'facut')}>
            <Check size={16} /> {mark === 'facut' ? 'Făcut' : 'Am văzut'}
          </button>
          <a className="fashion-card__link" href={item.url} target="_blank" rel="noreferrer">
            Detalii <ExternalLink size={13} />
          </a>
        </div>
      </article>
    )
  }

  return (
    <div style={{ '--accent': section.accent } as CSSProperties}>
      <PageHeader
        icon={
          <span className="icon-badge" style={{ width: 52, height: 52 }}>
            <Landmark size={26} />
          </span>
        }
        action={<GenerateButton task="culture" label="Adu lucruri noi" duration="15–25 de minute" />}
        eyebrow={section.tagline}
        title={section.label}
        description="Filme, cărți, muzică și povești care îți dau ce să spui la o bere, plus locurile din București unde le găsești. Ce marchezi se salvează în repo-ul tău."
      />

      <div className="learning-areas" role="group" aria-label="Alege o secțiune">
        {TABS.map((t) => (
          <button key={t.id} className="chip" aria-pressed={tab === t.id} onClick={() => setTab(t.id)}>
            {t.emoji} {t.label}
            {t.id === 'lista' && mine.length > 0 && <span>{mine.length}</span>}
          </button>
        ))}
      </div>

      <p className="learning-hint">
        Actualizat pe {new Date(culture.generatedAt).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })}
        {state !== 'idle' && (
          <span className={`sync sync--${state}`}>
            {state === 'saving' && (
              <>
                <Loader2 size={13} className="generate__spin" /> se salvează
              </>
            )}
            {state === 'saved' && (
              <>
                <Cloud size={13} /> salvat în repo
              </>
            )}
            {state === 'offline' && (
              <>
                <CloudOff size={13} /> salvat local, urcă mai târziu
              </>
            )}
          </span>
        )}
      </p>

      {tab === 'recomandari' && (
        <>
          <div className="learning-areas" role="group" aria-label="Filtrează">
            <button className="chip" aria-pressed={kind === ''} onClick={() => setKind('')}>
              Toate <span>{culture.recommendations.length}</span>
            </button>
            {cultureKinds.map((k) => (
              <button key={k.id} className="chip" aria-pressed={kind === k.id} onClick={() => setKind(k.id)}>
                {k.emoji} {k.label} <span>{culture.recommendations.filter((r) => r.kind === k.id).length}</span>
              </button>
            ))}
          </div>
          <div className="card-grid">
            {shown.map((item) => (
              <Card key={item.id} item={item} />
            ))}
          </div>
        </>
      )}

      {tab === 'povesti' && (
        <div className="card-grid">
          {culture.stories.map((story) => (
            <button key={story.id} className="article-card" onClick={() => setOpenStory(story)}>
              <h3>{story.title}</h3>
              <p className="article-card__hook">{story.body.slice(0, 160)}…</p>
              <span className="article-card__meta">
                <span>
                  <MessageCircle size={14} /> cum o spui
                </span>
              </span>
            </button>
          ))}
        </div>
      )}

      {tab === 'locuri' && (
        <div className="card-grid">
          {culture.places.map((place) => {
            const mark = marks[place.id]
            return (
              <article key={place.id} className="culture-card">
                <span className="fashion-card__layer">{place.kind}</span>
                <h3>{place.name}</h3>
                <p className="fashion-card__look">
                  <MapPin size={14} /> {place.address}
                </p>
                <p>{place.what}</p>
                {place.practical && <p className="culture-card__where">{place.practical}</p>}
                <div className="fashion-card__actions">
                  <button className="button button--ghost" aria-pressed={mark === 'vreau'} onClick={() => void toggle(place.id, 'vreau')}>
                    <BookmarkPlus size={16} /> {mark === 'vreau' ? 'În listă' : 'Vreau'}
                  </button>
                  <button className="button button--ghost" aria-pressed={mark === 'facut'} onClick={() => void toggle(place.id, 'facut')}>
                    <Check size={16} /> {mark === 'facut' ? 'Am fost' : 'Am fost?'}
                  </button>
                  <a className="fashion-card__link" href={place.url} target="_blank" rel="noreferrer">
                    Deschide <ExternalLink size={13} />
                  </a>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {tab === 'lista' && (
        <>
          {mine.length === 0 ? (
            <p className="learning-hint">Nimic marcat încă. Apasă „Vreau” pe ce te atrage și apare aici.</p>
          ) : (
            <ul className="mine">
              {mine.map((item) => {
                const name = 'title' in item ? item.title : item.name
                const detail = 'author' in item ? `${item.author} · ${item.length}` : item.address
                return (
                  <li key={item.id}>
                    <span className={`mine__state mine__state--${marks[item.id]}`}>{marks[item.id] === 'facut' ? 'făcut' : 'vreau'}</span>
                    <div>
                      <strong>{name}</strong>
                      <p>{detail}</p>
                    </div>
                    <a href={item.url} target="_blank" rel="noreferrer">
                      <ExternalLink size={15} />
                    </a>
                  </li>
                )
              })}
            </ul>
          )}
        </>
      )}

      {openStory && (
        <div className="reader-backdrop" onClick={() => setOpenStory(null)}>
          <article className="reader" role="dialog" aria-modal="true" aria-label={openStory.title} onClick={(e) => e.stopPropagation()}>
            <button className="reader__close" aria-label="Închide povestea" onClick={() => setOpenStory(null)}>
              ✕
            </button>
            <h1>{openStory.title}</h1>
            <p>{openStory.body}</p>
            <div className="reader__box reader__box--action">
              <strong>
                <MessageCircle size={16} /> Cum o spui în 30 de secunde
              </strong>
              <p>{openStory.tellIt}</p>
            </div>
            <footer className="reader__sources">
              <strong>Surse</strong>
              {openStory.sources.map((s) => (
                <a key={s.url} href={s.url} target="_blank" rel="noreferrer">
                  {s.title} <ExternalLink size={13} />
                </a>
              ))}
            </footer>
          </article>
        </div>
      )}
    </div>
  )
}
