/**
 * The journal, kept in the private GitHub repo so it survives deploys, devices and browsers (spec 0008).
 *   GET  /api/journal?month=2026-09   → that month's entries
 *   PUT  /api/journal                 → saves one entry (same id overwrites it)
 *   DELETE /api/journal?id=…&month=…  → removes one entry
 * One file per month, `journal/<YYYY-MM>.json`, outside `app/`, so the site's build never touches it.
 * Env: GITHUB_REPO and GITHUB_DISPATCH_TOKEN (needs Contents: read and write besides Actions).
 */
export type JournalEntry = {
  id: string
  /** YYYY-MM-DD */
  date: string
  /** 1 (foarte prost) … 5 (foarte bine) */
  mood: number
  /** What he is grateful for, up to 3 lines. */
  gratitude: string[]
  /** Anything else he wants to write. */
  note: string
  updatedAt: string
}

const MONTH = /^\d{4}-\d{2}$/
const path = (month: string) => `journal/${month}.json`

async function github(url: string, init?: RequestInit) {
  const repo = process.env.GITHUB_REPO
  const token = process.env.GITHUB_DISPATCH_TOKEN
  if (!repo || !token) throw new Error('GITHUB_REPO sau GITHUB_DISPATCH_TOKEN nu sunt setate în Vercel.')
  return fetch(`https://api.github.com/repos/${repo}${url}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'grow-app',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
    },
  })
}

/** The month's file plus its sha, which GitHub needs to replace it. */
async function readMonth(month: string): Promise<{ entries: JournalEntry[]; sha?: string }> {
  const res = await github(`/contents/${path(month)}`)
  if (res.status === 404) return { entries: [] }
  if (!res.ok) throw new Error(`GitHub a răspuns ${res.status} la citire: ${await res.text()}`)
  const file = (await res.json()) as { content: string; sha: string }
  const text = Buffer.from(file.content, 'base64').toString('utf8')
  const data = JSON.parse(text) as { entries?: JournalEntry[] }
  return { entries: Array.isArray(data.entries) ? data.entries : [], sha: file.sha }
}

async function writeMonth(month: string, entries: JournalEntry[], sha: string | undefined, message: string) {
  const body = JSON.stringify({
    message,
    content: Buffer.from(`${JSON.stringify({ month, entries }, null, 2)}\n`, 'utf8').toString('base64'),
    ...(sha ? { sha } : {}),
  })
  const res = await github(`/contents/${path(month)}`, { method: 'PUT', body })
  if (!res.ok) throw new Error(`GitHub a răspuns ${res.status} la salvare: ${await res.text()}`)
}

const fail = (error: unknown, status = 500) => Response.json({ error: error instanceof Error ? error.message : String(error) }, { status })
const monthOf = (request: Request) => new URL(request.url).searchParams.get('month') ?? ''

export async function GET(request: Request) {
  const month = monthOf(request)
  if (!MONTH.test(month)) return fail('month trebuie să fie YYYY-MM', 400)
  try {
    const { entries } = await readMonth(month)
    return Response.json({ month, entries }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    return fail(error)
  }
}

export async function PUT(request: Request) {
  const entry = (await request.json().catch(() => null)) as JournalEntry | null
  if (!entry?.id || !/^\d{4}-\d{2}-\d{2}$/.test(entry.date ?? '')) return fail('intrarea are nevoie de id și date', 400)
  const month = entry.date.slice(0, 7)
  try {
    const { entries, sha } = await readMonth(month)
    const saved: JournalEntry = {
      id: entry.id,
      date: entry.date,
      mood: Number(entry.mood) || 3,
      gratitude: (entry.gratitude ?? []).filter((g) => typeof g === 'string' && g.trim()).slice(0, 3),
      note: typeof entry.note === 'string' ? entry.note : '',
      updatedAt: new Date().toISOString(),
    }
    const next = [saved, ...entries.filter((e) => e.id !== entry.id)].sort((a, b) => b.date.localeCompare(a.date))
    await writeMonth(month, next, sha, `journal: ${entry.date}`)
    return Response.json({ entry: saved })
  } catch (error) {
    return fail(error)
  }
}

export async function DELETE(request: Request) {
  const url = new URL(request.url)
  const id = url.searchParams.get('id')
  const month = monthOf(request)
  if (!id || !MONTH.test(month)) return fail('id și month sunt obligatorii', 400)
  try {
    const { entries, sha } = await readMonth(month)
    if (!sha) return Response.json({ ok: true })
    await writeMonth(month, entries.filter((e) => e.id !== id), sha, `journal: șters ${id}`)
    return Response.json({ ok: true })
  } catch (error) {
    return fail(error)
  }
}
