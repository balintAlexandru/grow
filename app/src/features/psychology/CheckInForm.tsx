import { useState } from 'react'
import { Check, Cloud, CloudOff, Loader2 } from 'lucide-react'
import type { JournalEntry, SyncState } from './journal'
import { MOODS } from './moods'

type CheckInFormProps = {
  /** Today, YYYY-MM-DD. */
  date: string
  /** Today's entry, when it was already written (from this browser or the repo). */
  entry?: JournalEntry
  title: string
  streakLine: string
  count: number
  state: SyncState
  onSave: (draft: Omit<JournalEntry, 'updatedAt'>) => void
}

/**
 * Today's check-in. The parent gives it a `key` of the entry id, so when the repo copy arrives
 * the form is recreated with it instead of being patched from an effect.
 */
export default function CheckInForm({ date, entry, title, streakLine, count, state, onSave }: CheckInFormProps) {
  const [mood, setMood] = useState(entry?.mood ?? 3)
  const [gratitude, setGratitude] = useState<string[]>([...(entry?.gratitude ?? []), '', '', ''].slice(0, 3))
  const [note, setNote] = useState(entry?.note ?? '')

  return (
    <form
      className="checkin"
      onSubmit={(event) => {
        event.preventDefault()
        onSave({ id: entry?.id ?? `${date}-${crypto.randomUUID().slice(0, 8)}`, date, mood, gratitude, note })
      }}
    >
      <header className="checkin__head">
        <div>
          <h2>{title}</h2>
          <p className="learning-hint">{streakLine}</p>
        </div>
        <span className={`sync sync--${state}`}>
          {state === 'saving' && (
            <>
              <Loader2 size={14} className="generate__spin" /> se salvează
            </>
          )}
          {state === 'saved' && (
            <>
              <Check size={14} /> salvat în repo
            </>
          )}
          {state === 'offline' && (
            <>
              <CloudOff size={14} /> salvat local, urcă la următoarea încercare
            </>
          )}
          {(state === 'idle' || state === 'error') && (
            <>
              <Cloud size={14} /> {count} {count === 1 ? 'intrare' : 'intrări'}
            </>
          )}
        </span>
      </header>

      <fieldset className="checkin__moods">
        <legend>Cum te simți azi?</legend>
        {MOODS.map((m) => (
          <button type="button" key={m.value} className="mood" aria-pressed={mood === m.value} onClick={() => setMood(m.value)}>
            <span>{m.emoji}</span>
            {m.label}
          </button>
        ))}
      </fieldset>

      <fieldset>
        <legend>Trei lucruri pentru care ești recunoscător</legend>
        {gratitude.map((line, i) => (
          <input
            key={i}
            value={line}
            placeholder={i === 0 ? 'Ceva mic de azi: o cafea bună, o discuție' : i === 1 ? 'Cineva din viața ta' : 'Ceva la tine însuți'}
            onChange={(e) => setGratitude(gratitude.map((g, j) => (i === j ? e.target.value : g)))}
          />
        ))}
      </fieldset>

      <fieldset>
        <legend>Ce s-a întâmplat și ce ai simțit</legend>
        <textarea rows={6} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Scrie fără să te cenzurezi. Nu citește nimeni altcineva." />
      </fieldset>

      <button className="button" type="submit">
        <Check size={18} /> {entry ? 'Actualizează ziua' : 'Salvează ziua'}
      </button>
    </form>
  )
}
