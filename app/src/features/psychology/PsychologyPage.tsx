import { useState } from 'react'
import { Brain, Check, ExternalLink, Search, Trash2 } from 'lucide-react'
import type { CSSProperties } from 'react'
import GenerateButton from '../../components/GenerateButton/GenerateButton'
import PageHeader from '../../components/PageHeader/PageHeader'
import type { Section } from '../../config/sections'
import CheckInForm from './CheckInForm'
import ExercisePlayer from './ExercisePlayer'
import guide from '../../content/psychology/guide.json'
import { findTopic, psychologyTopics } from './topics'
import { todayKey, useJournal, type JournalEntry } from './journal'
import { MOODS } from './moods'
import type { PsychologyArticle, PsychologyExercise, PsychologyGuide } from './types'
import './psychology.css'

const content = guide as PsychologyGuide

const TABS = [
  { id: 'azi', label: 'Azi', emoji: '📝' },
  { id: 'jurnal', label: 'Jurnal', emoji: '📓' },
  { id: 'exercitii', label: 'Exerciții', emoji: '🧘' },
  { id: 'articole', label: 'Articole', emoji: '📚' },
] as const

const longDate = (key: string) => new Date(`${key}T12:00:00`).toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long' })

export default function PsychologyPage({ section }: { section: Section }) {
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('azi')
  const [openExercise, setOpenExercise] = useState<PsychologyExercise | null>(null)
  const [openArticle, setOpenArticle] = useState<PsychologyArticle | null>(null)
  const [query, setQuery] = useState('')
  const { entries, state, save, remove, entryFor } = useJournal()

  const today = todayKey()
  const existing = entryFor(today)

  const streak = (() => {
    const days = new Set(entries.map((e) => e.date))
    let count = 0
    for (let i = 0; ; i++) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      if (!days.has(key)) break
      count++
    }
    return count
  })()

  const filtered = query
    ? entries.filter((e) => `${e.note} ${e.gratitude.join(' ')}`.toLowerCase().includes(query.toLowerCase()))
    : entries

  return (
    <div style={{ '--accent': section.accent } as CSSProperties}>
      <PageHeader
        icon={
          <span className="icon-badge" style={{ width: 52, height: 52 }}>
            <Brain size={26} />
          </span>
        }
        action={<GenerateButton task="psychology" label="Actualizează articolele" duration="15–25 de minute" />}
        eyebrow={section.tagline}
        title={section.label}
        description="Scrii cum a fost ziua, faci un exercițiu când ai nevoie și citești lucruri verificate despre emoții, anxietate, relații și sens. Ce scrii se salvează în repo-ul tău privat."
      />

      <div className="learning-areas" role="group" aria-label="Alege o secțiune">
        {TABS.map((t) => (
          <button key={t.id} className="chip" aria-pressed={tab === t.id} onClick={() => setTab(t.id)}>
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      {tab === 'azi' && (
        <CheckInForm
          key={existing?.id ?? 'nou'}
          date={today}
          entry={existing}
          title={longDate(today)}
          streakLine={streak > 0 ? `${streak} ${streak === 1 ? 'zi scrisă la rând' : 'zile scrise la rând'}` : 'Prima zi: scrie două rânduri, atât.'}
          count={entries.length}
          state={state}
          onSave={(draft) => void save(draft)}
        />
      )}

      {tab === 'jurnal' && (
        <>
          <label className="search">
            <Search size={16} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Caută în tot ce ai scris" />
          </label>
          {filtered.length === 0 ? (
            <p className="learning-hint">{entries.length === 0 ? 'Încă nu ai scris nimic. Începe din „Azi”.' : 'Nimic găsit.'}</p>
          ) : (
            <ul className="entries">
              {filtered.map((entry: JournalEntry) => (
                <li key={entry.id}>
                  <div className="entries__head">
                    <strong>{longDate(entry.date)}</strong>
                    <span>{MOODS.find((m) => m.value === entry.mood)?.emoji}</span>
                    <button aria-label="Șterge ziua" onClick={() => void remove(entry)}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                  {entry.gratitude.filter(Boolean).length > 0 && (
                    <ul className="entries__gratitude">
                      {entry.gratitude.filter(Boolean).map((g) => (
                        <li key={g}>{g}</li>
                      ))}
                    </ul>
                  )}
                  {entry.note && <p>{entry.note}</p>}
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {tab === 'exercitii' && (
        <div className="card-grid">
          {content.exercises.map((exercise) => (
            <button key={exercise.id} className="article-card" onClick={() => setOpenExercise(exercise)}>
              <span className="article-card__area">{exercise.forWhat}</span>
              <h3>{exercise.name}</h3>
              <p className="article-card__hook">{exercise.why}</p>
              <span className="article-card__meta">
                <span>{exercise.minutes} min</span>
                <span>{exercise.steps.length} pași</span>
              </span>
            </button>
          ))}
        </div>
      )}

      {tab === 'articole' && (
        <>
          <p className="learning-hint">
            Actualizate pe {new Date(content.generatedAt).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <div className="card-grid">
            {content.articles.map((article) => {
              const topic = findTopic(article.topicId)
              return (
                <button key={article.id} className="article-card" onClick={() => setOpenArticle(article)}>
                  {topic && (
                    <span className="article-card__area">
                      {topic.emoji} {topic.label}
                    </span>
                  )}
                  <h3>{article.title}</h3>
                  <p className="article-card__hook">{article.hook}</p>
                  <span className="article-card__meta">
                    <span>{article.readingMinutes} min</span>
                  </span>
                </button>
              )
            })}
          </div>
          <p className="learning-hint">
            Teme acoperite: {psychologyTopics.map((t) => t.label).join(' · ')}
          </p>
        </>
      )}

      {openExercise && <ExercisePlayer exercise={openExercise} onClose={() => setOpenExercise(null)} />}

      {openArticle && (
        <div className="reader-backdrop" onClick={() => setOpenArticle(null)}>
          <article className="reader" role="dialog" aria-modal="true" aria-label={openArticle.title} onClick={(e) => e.stopPropagation()}>
            <button className="reader__close" aria-label="Închide articolul" onClick={() => setOpenArticle(null)}>
              ✕
            </button>
            <p className="reader__meta">{openArticle.readingMinutes} min de citit</p>
            <h1>{openArticle.title}</h1>
            <p className="reader__hook">{openArticle.hook}</p>
            <div className="reader__box reader__box--core">
              <strong>Ideea pe scurt</strong>
              <p>{openArticle.coreIdea}</p>
            </div>
            {openArticle.sections.map((s) => (
              <section key={s.heading}>
                <h2>{s.heading}</h2>
                <p>{s.body}</p>
              </section>
            ))}
            <h2>De reținut</h2>
            <ul className="reader__takeaways">
              {openArticle.takeaways.map((t) => (
                <li key={t}>
                  <Check size={18} /> {t}
                </li>
              ))}
            </ul>
            <div className="reader__box reader__box--action">
              <strong>Încearcă azi</strong>
              <p>{openArticle.tryToday}</p>
            </div>
            <footer className="reader__sources">
              <strong>Surse</strong>
              {openArticle.sources.map((s) => (
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
