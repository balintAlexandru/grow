/**
 * Starts a content run on GitHub Actions and reports its status (spec 0006).
 *   POST /api/generate  { "task": "learning" | "events" }  → dispatches the workflow
 *   GET  /api/generate?task=learning                        → latest run of that workflow
 * Protected by middleware.ts like the rest of the site. Env (Vercel project):
 *   GITHUB_REPO            "owner/name"
 *   GITHUB_DISPATCH_TOKEN  fine-grained token for that repo only, permission Actions: read and write
 */
const WORKFLOWS = { learning: 'learning-daily.yml', events: 'events-refresh.yml', fashion: 'fashion-refresh.yml' } as const
type Task = keyof typeof WORKFLOWS

type Run = { id: number; status: string; conclusion: string | null; created_at: string; html_url: string }
type Job = { steps?: { name: string; conclusion: string | null }[] }

/** Must match the step name in .github/workflows/run-skill.yml. */
const PUBLISH_STEP = 'Publish new content'

const isTask = (value: unknown): value is Task => typeof value === 'string' && value in WORKFLOWS

async function github(path: string, init?: RequestInit) {
  const repo = process.env.GITHUB_REPO
  const token = process.env.GITHUB_DISPATCH_TOKEN
  if (!repo || !token) throw new Error('GITHUB_REPO sau GITHUB_DISPATCH_TOKEN nu sunt setate în Vercel.')
  return fetch(`https://api.github.com/repos/${repo}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'grow-app',
    },
  })
}

async function latestRun(task: Task): Promise<Run | null> {
  const res = await github(`/actions/workflows/${WORKFLOWS[task]}/runs?per_page=1&event=workflow_dispatch`)
  if (!res.ok) throw new Error(`GitHub a răspuns ${res.status}`)
  const data = (await res.json()) as { workflow_runs: Run[] }
  return data.workflow_runs[0] ?? null
}

/** Whether a finished run committed new content; the publish step is skipped when nothing changed. */
async function published(run: Run) {
  const res = await github(`/actions/runs/${run.id}/jobs`)
  if (!res.ok) return undefined
  const { jobs } = (await res.json()) as { jobs: Job[] }
  const step = jobs.flatMap((j) => j.steps ?? []).find((s) => s.name === PUBLISH_STEP)
  return step ? step.conclusion === 'success' : undefined
}

async function toJson(run: Run | null) {
  if (!run) return { status: 'none' }
  const base = { status: run.status, conclusion: run.conclusion, createdAt: run.created_at, url: run.html_url }
  return run.status === 'completed' && run.conclusion === 'success' ? { ...base, published: await published(run) } : base
}

const fail = (error: unknown, status = 500) => Response.json({ error: error instanceof Error ? error.message : String(error) }, { status })

export async function GET(request: Request) {
  const task = new URL(request.url).searchParams.get('task')
  if (!isTask(task)) return fail(`task trebuie să fie ${Object.keys(WORKFLOWS).join(', ')}`, 400)
  try {
    return Response.json(await toJson(await latestRun(task)), { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    return fail(error)
  }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { task?: unknown }
  if (!isTask(body.task)) return fail(`task trebuie să fie ${Object.keys(WORKFLOWS).join(', ')}`, 400)
  try {
    const current = await latestRun(body.task)
    if (current && current.status !== 'completed') return Response.json(await toJson(current), { status: 409 })

    const res = await github(`/actions/workflows/${WORKFLOWS[body.task]}/dispatches`, {
      method: 'POST',
      body: JSON.stringify({ ref: 'main' }),
    })
    if (res.status !== 204) return fail(`GitHub a refuzat pornirea (${res.status}): ${await res.text()}`, 502)
    return Response.json({ status: 'queued' }, { status: 202 })
  } catch (error) {
    return fail(error)
  }
}
