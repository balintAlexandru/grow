// Validates src/content/culture/guide.json (written by the /culture-refresh skill).
// `--fix` fills ids and sorts recommendations by kind. Exit code 1 when something needs a human or the skill.
// What the owner marks is not checked here: it lives in data/culture.json in the repo, written by /api/store.
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const FILE = join(ROOT, 'src/content/culture/guide.json')
const FIX = process.argv.includes('--fix')
const MIN = { recommendations: 8, stories: 3, places: 5 }
const STORY_WORDS = { min: 110, max: 260 }

const kindIds = [...readFileSync(join(ROOT, 'src/features/culture/kinds.ts'), 'utf8').matchAll(/id: '([\w-]+)'/g)].map((m) => m[1])

const errors = []
const warnings = []
const isText = (v) => typeof v === 'string' && v.trim().length > 0
const isUrl = (v) => /^https:\/\//.test(v ?? '')
const slug = (s) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50).replace(/-$/, '')

async function urlStatus(url) {
  try {
    const res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(10000), headers: { 'user-agent': 'Mozilla/5.0 (culture:check)' } })
    return res.status
  } catch {
    return undefined // network problem or blocked: unknown, not dead
  }
}

const data = JSON.parse(readFileSync(FILE, 'utf8'))
if (!/^\d{4}-\d{2}-\d{2}$/.test(data.generatedAt ?? '')) errors.push('generatedAt trebuie să fie YYYY-MM-DD')
for (const [key, min] of Object.entries(MIN)) {
  if (!Array.isArray(data[key])) errors.push(`${key} trebuie să fie o listă`)
  else if (data[key].length < min) warnings.push(`${key}: doar ${data[key].length} (minimul recomandat e ${min})`)
}
if (errors.length) {
  for (const e of errors) console.log(`✖  ${e}`)
  process.exit(1)
}

const urls = []
const ids = new Set()
const fillId = (entry, at, from) => {
  if (!isText(entry.id) && isText(from)) {
    if (FIX) entry.id = slug(from)
    else errors.push(`${at}: lipsește id (rulează cu --fix)`)
  }
  // Ids are what the owner's marks point at, so a repeated id would mix two things up.
  if (isText(entry.id)) {
    if (ids.has(entry.id)) errors.push(`${at}: id repetat "${entry.id}"`)
    ids.add(entry.id)
  }
}
const need = (entry, at, fields) => {
  for (const field of fields) if (!isText(entry[field])) errors.push(`${at}: lipsește ${field}`)
  if (entry.url !== undefined) {
    if (!isUrl(entry.url)) errors.push(`${at}: url trebuie să înceapă cu https://`)
    else urls.push([at, entry.url])
  }
}

const thisYear = new Date().getFullYear()
for (const [i, r] of data.recommendations.entries()) {
  const at = `recomandarea ${i + 1} (${r.title ?? '?'})`
  need(r, at, ['title', 'author', 'why', 'talkingPoint', 'length', 'whereToFind', 'url'])
  if (!kindIds.includes(r.kind)) errors.push(`${at}: kind "${r.kind}" nu e în kinds.ts`)
  if (!Number.isInteger(r.year) || r.year < 1 || r.year > thisYear) errors.push(`${at}: year trebuie să fie un an până în ${thisYear}`)
  fillId(r, at, `${r.kind}-${r.title}`)
}
for (const id of kindIds) if (!data.recommendations.some((r) => r.kind === id)) warnings.push(`nicio recomandare de tipul "${id}"`)

for (const [i, s] of data.stories.entries()) {
  const at = `povestea ${i + 1} (${s.title ?? '?'})`
  need(s, at, ['title', 'body', 'tellIt'])
  if (!Array.isArray(s.sources) || s.sources.length === 0) errors.push(`${at}: cel puțin o sursă`)
  for (const source of s.sources ?? []) {
    if (!isText(source.title) || !isUrl(source.url)) errors.push(`${at}: sursă invalidă ${JSON.stringify(source)}`)
    else urls.push([at, source.url])
  }
  const words = (s.body ?? '').split(/\s+/).filter(Boolean).length
  if (words < STORY_WORDS.min || words > STORY_WORDS.max) warnings.push(`${at}: ${words} cuvinte (ținta e 120–220)`)
  fillId(s, at, s.title)
}

for (const [i, p] of data.places.entries()) {
  const at = `locul ${i + 1} (${p.name ?? '?'})`
  need(p, at, ['name', 'kind', 'address', 'what', 'url'])
  if (p.practical !== undefined && !isText(p.practical)) errors.push(`${at}: practical trebuie să fie text sau să lipsească`)
  fillId(p, at, p.name)
}

await Promise.all(
  urls.map(async ([at, url]) => {
    const status = await urlStatus(url)
    if (status === 404 || status === 410) errors.push(`${at}: URL mort (${status}) ${url}`)
    else if (status === undefined) warnings.push(`${at}: URL neverificat (rețea sau blocat) ${url}`)
  }),
)

if (FIX) {
  data.recommendations.sort((a, b) => kindIds.indexOf(a.kind) - kindIds.indexOf(b.kind) || a.title.localeCompare(b.title))
  writeFileSync(FILE, `${JSON.stringify(data, null, 2)}\n`)
}

console.log(`guide.json: ${data.recommendations.length} recomandări · ${data.stories.length} povești · ${data.places.length} locuri`)
for (const w of warnings) console.log(`⚠  ${w}`)
for (const e of errors) console.log(`✖  ${e}`)
if (errors.length) process.exit(1)
console.log('✔ guide.json e valid')
