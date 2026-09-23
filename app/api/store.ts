/**
 * A small JSON store in the private repo, for the lists the owner keeps (spec 0009).
 *   GET /api/store?key=culture  → what is saved under that key
 *   PUT /api/store?key=culture  → replaces it with the body
 * One file per key, `data/<key>.json`, outside `app/`, so the site's build never touches it.
 * Same token as the rest: GITHUB_REPO and GITHUB_DISPATCH_TOKEN (Contents: read and write).
 */
const KEYS = ['culture']
const path = (key: string) => `data/${key}.json`

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

async function read(key: string): Promise<{ value: unknown; sha?: string }> {
  const res = await github(`/contents/${path(key)}`)
  if (res.status === 404) return { value: null }
  if (!res.ok) throw new Error(`GitHub a răspuns ${res.status} la citire: ${await res.text()}`)
  const file = (await res.json()) as { content: string; sha: string }
  return { value: JSON.parse(Buffer.from(file.content, 'base64').toString('utf8')), sha: file.sha }
}

const fail = (error: unknown, status = 500) => Response.json({ error: error instanceof Error ? error.message : String(error) }, { status })
const keyOf = (request: Request) => new URL(request.url).searchParams.get('key') ?? ''

export async function GET(request: Request) {
  const key = keyOf(request)
  if (!KEYS.includes(key)) return fail(`key trebuie să fie ${KEYS.join(' sau ')}`, 400)
  try {
    const { value } = await read(key)
    return Response.json({ key, value }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    return fail(error)
  }
}

export async function PUT(request: Request) {
  const key = keyOf(request)
  if (!KEYS.includes(key)) return fail(`key trebuie să fie ${KEYS.join(' sau ')}`, 400)
  const value = await request.json().catch(() => null)
  if (value === null) return fail('corpul cererii trebuie să fie JSON', 400)
  try {
    const { sha } = await read(key)
    const res = await github(`/contents/${path(key)}`, {
      method: 'PUT',
      body: JSON.stringify({
        message: `data: ${key}`,
        content: Buffer.from(`${JSON.stringify(value, null, 2)}\n`, 'utf8').toString('base64'),
        ...(sha ? { sha } : {}),
      }),
    })
    if (!res.ok) throw new Error(`GitHub a răspuns ${res.status} la salvare: ${await res.text()}`)
    return Response.json({ ok: true })
  } catch (error) {
    return fail(error)
  }
}
