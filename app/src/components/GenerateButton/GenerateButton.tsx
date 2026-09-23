import { useCallback, useEffect, useRef, useState } from 'react'
import { ExternalLink, Loader2, RefreshCw, Sparkles } from 'lucide-react'
import './GenerateButton.css'

type Task = 'learning' | 'events' | 'fashion' | 'psychology'
type RunInfo = { status: string; conclusion?: string | null; createdAt?: string; url?: string; published?: boolean }
type State =
  | { kind: 'idle' }
  | { kind: 'running'; url?: string }
  | { kind: 'done'; ok: boolean; published?: boolean; url?: string }
  | { kind: 'error'; message: string }

const POLL_MS = 15_000
/** GitHub's clock and the browser's can differ; a run created this long before the click still counts as ours. */
const CLOCK_SLACK_MS = 2 * 60_000

async function fetchRun(task: Task): Promise<RunInfo> {
  const res = await fetch(`/api/generate?task=${task}`, { cache: 'no-store' })
  const data = (await res.json()) as RunInfo & { error?: string }
  if (!res.ok) throw new Error(data.error ?? `Eroare ${res.status}`)
  return data
}

/**
 * Starts the Claude Code skill for this section on GitHub Actions (spec 0006) and follows the run.
 * When it finishes, the new content is committed, Vercel rebuilds, and a reload shows it.
 * Only works on the deployed site; `npm run dev` has no /api.
 */
type GenerateButtonProps = { task: Task; label: string; /** Shown while the run works, e.g. "20–30 de minute". */ duration: string }

export default function GenerateButton({ task, label, duration }: GenerateButtonProps) {
  const [state, setState] = useState<State>({ kind: 'idle' })
  const requestedAt = useRef<number | null>(null)

  const check = useCallback(async () => {
    try {
      const run = await fetchRun(task)
      const created = run.createdAt ? Date.parse(run.createdAt) : 0
      const ours = requestedAt.current !== null && created >= requestedAt.current - CLOCK_SLACK_MS
      if (run.status !== 'completed' && run.status !== 'none') setState({ kind: 'running', url: run.url })
      else if (ours) setState({ kind: 'done', ok: run.conclusion === 'success', published: run.published, url: run.url })
      else if (requestedAt.current === null) setState({ kind: 'idle' })
      // otherwise the dispatched run is not listed yet: stay "running" and poll again
    } catch (error) {
      setState({ kind: 'error', message: (error as Error).message })
    }
  }, [task])

  // On load, pick up a run that is already going (started from another tab or device).
  useEffect(() => {
    if (import.meta.env.DEV) return
    let active = true
    fetchRun(task)
      .then((run) => {
        if (active && run.status !== 'completed' && run.status !== 'none') setState({ kind: 'running', url: run.url })
      })
      .catch(() => {
        // The button still works; the status shows up after a click.
      })
    return () => {
      active = false
    }
  }, [task])

  const waiting = state.kind === 'running'
  useEffect(() => {
    if (!waiting) return
    const id = setInterval(() => void check(), POLL_MS)
    return () => clearInterval(id)
  }, [waiting, check])

  async function start() {
    requestedAt.current = Date.now()
    setState({ kind: 'running' })
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task }),
      })
      // A run was already going: follow that one, whenever it started.
      if (res.status === 409) requestedAt.current = 0
      else if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(data.error ?? `Eroare ${res.status}`)
      }
    } catch (error) {
      requestedAt.current = null
      setState({ kind: 'error', message: (error as Error).message })
    }
  }

  if (import.meta.env.DEV) {
    return (
      <button className="button" disabled title="Funcționează doar pe site-ul publicat">
        <Sparkles size={18} /> {label}
      </button>
    )
  }

  return (
    <div className="generate">
      {state.kind === 'running' ? (
        <button className="button" disabled>
          <Loader2 size={18} className="generate__spin" /> Se generează…
        </button>
      ) : state.kind === 'done' && state.ok && state.published !== false ? (
        <button className="button" onClick={() => location.reload()}>
          <RefreshCw size={18} /> Reîncarcă pagina
        </button>
      ) : (
        <button className="button" onClick={() => void start()}>
          <Sparkles size={18} /> {label}
        </button>
      )}
      <p className="generate__status" role="status">
        {state.kind === 'running' && `Claude lucrează, durează cam ${duration}. Poți închide pagina.`}
        {state.kind === 'done' && state.ok && state.published !== false && 'Gata. Site-ul se reconstruiește în 1–2 minute, apoi reîncarcă.'}
        {state.kind === 'done' && state.ok && state.published === false && 'Rularea s-a terminat, dar n-a apărut nimic nou de publicat.'}
        {state.kind === 'done' && !state.ok && 'Rularea a eșuat. '}
        {state.kind === 'error' && `Nu am putut porni: ${state.message}`}
        {'url' in state && state.url && (state.kind === 'running' || (state.kind === 'done' && !state.ok)) && (
          <a href={state.url} target="_blank" rel="noreferrer">
            {' '}
            Vezi pe GitHub <ExternalLink size={12} />
          </a>
        )}
      </p>
    </div>
  )
}
