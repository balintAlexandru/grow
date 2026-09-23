// Validates src/content/psychology/guide.json (written by the /psychology-refresh skill).
// `--fix` fills ids and reading time. The journal is not checked here: it lives in the repo, written by /api/journal.
// Exit code 1 when something needs a human or the skill.
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const FILE = join(ROOT, 'src/content/psychology/guide.json')
const FIX = process.argv.includes('--fix')
const WORDS = { min: 180, max: 340 }

const topicIds = [...readFileSync(join(ROOT, 'src/features/psychology/topics.ts'), 'utf8').matchAll(/id: '([\w-]+)'/g)].map((m) => m[1])

const errors = []
const warnings = []
const isText = (v) => typeof v === 'string' && v.trim().length > 0
const isUrl = (v) => /^https:\/\//.test(v ?? '')
const slug = (s) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50).replace(/-$/, '')
const words = (parts) => parts.join(' ').split(/\s+/).filter(Boolean).length

async function urlStatus(url) {
  try {
    const res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(10000), headers: { 'user-agent': 'Mozilla/5.0 (psychology:check)' } })
    return res.status
  } catch {
    return undefined // network problem or blocked: unknown, not dead
  }
}

const data = JSON.parse(readFileSync(FILE, 'utf8'))
if (!/^\d{4}-\d{2}-\d{2}$/.test(data.generatedAt ?? '')) errors.push('generatedAt trebuie să fie YYYY-MM-DD')
for (const key of ['articles', 'exercises']) if (!Array.isArray(data[key])) errors.push(`${key} trebuie să fie o listă`)
if (errors.length) {
  for (const e of errors) console.log(`✖  ${e}`)
  process.exit(1)
}

const urls = []
const ids = new Set()
const titles = new Set()
const checkId = (entry, at, from) => {
  if (!isText(entry.id) && isText(from)) {
    if (FIX) entry.id = slug(from)
    else errors.push(`${at}: lipsește id (rulează cu --fix)`)
  }
  if (isText(entry.id)) {
    if (ids.has(entry.id)) errors.push(`${at}: id repetat "${entry.id}"`)
    ids.add(entry.id)
  }
  if (isText(from)) {
    if (titles.has(from)) errors.push(`${at}: titlu repetat "${from}"`)
    titles.add(from)
  }
}

for (const [i, a] of data.articles.entries()) {
  const at = `articolul ${i + 1} (${a.title ?? '?'})`
  for (const field of ['title', 'hook', 'coreIdea', 'tryToday']) if (!isText(a[field])) errors.push(`${at}: lipsește ${field}`)
  if (!topicIds.includes(a.topicId)) errors.push(`${at}: topicId "${a.topicId}" nu e în topics.ts`)
  if (!Array.isArray(a.sections) || a.sections.length < 2 || !a.sections.every((s) => isText(s.heading) && isText(s.body)))
    errors.push(`${at}: cel puțin 2 secțiuni cu heading și body`)
  if (!Array.isArray(a.takeaways) || a.takeaways.length !== 3 || !a.takeaways.every(isText)) errors.push(`${at}: exact 3 takeaways`)
  if (!Array.isArray(a.sources) || a.sources.length === 0) errors.push(`${at}: cel puțin o sursă`)
  for (const s of a.sources ?? []) {
    if (!isText(s.title) || !isUrl(s.url)) errors.push(`${at}: sursă invalidă ${JSON.stringify(s)}`)
    else urls.push([at, s.url])
  }
  checkId(a, at, a.title)
  const count = words([a.hook, a.coreIdea, ...(a.sections ?? []).map((s) => s.body)])
  if (count < WORDS.min || count > WORDS.max) warnings.push(`${at}: ${count} cuvinte (ținta e 200–300)`)
  if (FIX) a.readingMinutes = Math.max(1, Math.ceil((count + words([...(a.takeaways ?? []), a.tryToday])) / 200))
  else if (!Number.isInteger(a.readingMinutes)) errors.push(`${at}: lipsește readingMinutes (rulează cu --fix)`)
}
for (const id of topicIds) if (!data.articles.some((a) => a.topicId === id)) warnings.push(`niciun articol pe tema "${id}"`)

for (const [i, e] of data.exercises.entries()) {
  const at = `exercițiul ${i + 1} (${e.name ?? '?'})`
  for (const field of ['name', 'forWhat', 'why']) if (!isText(e[field])) errors.push(`${at}: lipsește ${field}`)
  if (!Array.isArray(e.steps) || e.steps.length < 3) errors.push(`${at}: cel puțin 3 pași`)
  for (const [j, s] of (e.steps ?? []).entries()) {
    if (!isText(s.text)) errors.push(`${at}: pasul ${j + 1} nu are text`)
    if (s.seconds !== undefined && (!Number.isInteger(s.seconds) || s.seconds < 5 || s.seconds > 900))
      errors.push(`${at}: pasul ${j + 1} are seconds în afara intervalului 5–900`)
  }
  if (!Number.isInteger(e.minutes) || e.minutes < 1 || e.minutes > 30) errors.push(`${at}: minutes trebuie să fie între 1 și 30`)
  if (!isText(e.source?.title) || !isUrl(e.source?.url)) errors.push(`${at}: source are nevoie de title și url https`)
  else urls.push([at, e.source.url])
  checkId(e, at, e.name)
}

await Promise.all(
  urls.map(async ([at, url]) => {
    const status = await urlStatus(url)
    if (status === 404 || status === 410) errors.push(`${at}: URL mort (${status}) ${url}`)
    else if (status === undefined) warnings.push(`${at}: URL neverificat (rețea sau blocat) ${url}`)
  }),
)

if (FIX) writeFileSync(FILE, `${JSON.stringify(data, null, 2)}\n`)

console.log(`guide.json: ${data.articles.length} articole · ${data.exercises.length} exerciții`)
for (const w of warnings) console.log(`⚠  ${w}`)
for (const e of errors) console.log(`✖  ${e}`)
if (errors.length) process.exit(1)
console.log('✔ guide.json e valid')
