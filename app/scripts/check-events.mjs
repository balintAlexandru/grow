// Validates src/content/events/events.json (written by the /events-refresh skill).
// `--fix` also normalizes what a script can decide: missing ids, events from past months dropped, sorted by date.
// Existing ids are never rewritten: browsers merge their cache by id, so a changed id would show the event twice.
// Exit code 1 when something needs a human or the skill.
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const FILE = join(ROOT, 'src/content/events/events.json')
const FIX = process.argv.includes('--fix')
const SOURCES = ['facebook', 'instagram', 'web']

const categoryIds = [...readFileSync(join(ROOT, 'src/features/events/categories.ts'), 'utf8').matchAll(/id: '([\w-]+)'/g)].map((m) => m[1])

const errors = []
const warnings = []
const isText = (v) => typeof v === 'string' && v.trim().length > 0
const isDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v ?? '') && !Number.isNaN(Date.parse(`${v}T00:00:00Z`)) && new Date(`${v}T00:00:00Z`).toISOString().startsWith(v)
const slug = (s) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60).replace(/-$/, '')

const pad = (n) => String(n).padStart(2, '0')
const now = new Date()
const monthStart = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`
const nextMonthEnd = (() => {
  const d = new Date(now.getFullYear(), now.getMonth() + 2, 0)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
})()

async function urlStatus(url) {
  try {
    const res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(10000), headers: { 'user-agent': 'Mozilla/5.0 (events:check)' } })
    return res.status
  } catch {
    return undefined // network problem or blocked: unknown, not dead
  }
}

let data
try {
  data = JSON.parse(readFileSync(FILE, 'utf8'))
} catch (e) {
  console.error(`✗ events.json: ${e.message}`)
  process.exit(1)
}

if (!isText(data.city)) errors.push('lipsește city')
if (!isDate(data.generatedAt)) errors.push('generatedAt trebuie să fie YYYY-MM-DD')
if (!Array.isArray(data.events)) {
  console.error('✗ events.json: events trebuie să fie o listă')
  process.exit(1)
}

const before = data.events.length
if (FIX) data.events = data.events.filter((e) => !isDate(e.date) || (e.endDate ?? e.date) >= monthStart)
const dropped = before - data.events.length

const ids = new Map()
const seen = new Map()
await Promise.all(
  data.events.map(async (e, i) => {
    const at = `evenimentul ${i + 1} (${e.title ?? 'fără titlu'})`
    for (const field of ['title', 'venue', 'description', 'url']) if (!isText(e[field])) errors.push(`${at}: lipsește ${field}`)
    if (!categoryIds.includes(e.categoryId)) errors.push(`${at}: categoryId "${e.categoryId}" nu e în categories.ts`)
    if (!SOURCES.includes(e.source)) errors.push(`${at}: source trebuie să fie ${SOURCES.join(' | ')}`)
    if (!isDate(e.date)) errors.push(`${at}: date trebuie să fie YYYY-MM-DD valid`)
    if (e.endDate !== undefined && (!isDate(e.endDate) || e.endDate < e.date)) errors.push(`${at}: endDate invalid sau înainte de date`)
    if (e.weekdays !== undefined) {
      if (!Array.isArray(e.weekdays) || !e.weekdays.length || e.weekdays.some((d) => !Number.isInteger(d) || d < 0 || d > 6))
        errors.push(`${at}: weekdays trebuie să fie o listă de zile 0–6 (0 = duminică)`)
      else if (!e.endDate) errors.push(`${at}: un eveniment săptămânal are nevoie de endDate`)
      else if (isDate(e.date) && !e.weekdays.includes(new Date(`${e.date}T12:00:00Z`).getUTCDay()))
        errors.push(`${at}: date (${e.date}) trebuie să fie prima sesiune, într-una din zilele din weekdays`)
    }
    if (e.time !== undefined && !/^([01]\d|2[0-3]):[0-5]\d$/.test(e.time)) errors.push(`${at}: time trebuie să fie HH:MM`)
    if (isDate(e.date) && (e.endDate ?? e.date) < monthStart) errors.push(`${at}: s-a terminat înainte de luna curentă (rulează cu --fix)`)
    if (isDate(e.date) && e.date > nextMonthEnd) warnings.push(`${at}: e după luna viitoare, nu se va afișa curând`)
    if (isText(e.description) && e.description.length > 280) warnings.push(`${at}: descriere de ${e.description.length} caractere (max ~280)`)

    if (!isText(e.id) && isText(e.title) && isDate(e.date)) {
      if (FIX) e.id = `${slug(e.title)}-${e.date}`
      else errors.push(`${at}: lipsește id (rulează cu --fix)`)
    }
    if (isText(e.id)) {
      if (ids.has(e.id)) errors.push(`${at}: id duplicat "${e.id}"`)
      ids.set(e.id, at)
    }
    const key = `${e.date}|${e.time ?? ''}|${slug(e.venue ?? '')}`
    if (seen.has(key)) warnings.push(`${at}: aceeași dată, oră și locație ca ${seen.get(key)}; posibil duplicat`)
    seen.set(key, at)

    if (/^https:\/\//.test(e.url ?? '')) {
      const status = await urlStatus(e.url)
      if (status === 404 || status === 410) errors.push(`${at}: URL mort (${status}) ${e.url}`)
      else if (status === undefined) warnings.push(`${at}: URL neverificat (rețea sau blocat) ${e.url}`)
    } else if (isText(e.url)) errors.push(`${at}: url trebuie să înceapă cu https://`)
  }),
)

if (FIX) {
  data.events.sort((a, b) => (a.date ?? '').localeCompare(b.date ?? '') || (a.time ?? '').localeCompare(b.time ?? ''))
  writeFileSync(FILE, `${JSON.stringify(data, null, 2)}\n`)
}

const counts = Object.fromEntries(categoryIds.map((c) => [c, data.events.filter((e) => e.categoryId === c).length]))
console.log(`events.json: ${data.events.length} evenimente${dropped ? `, ${dropped} din lunile trecute scoase` : ''}`)
console.log(`  ${Object.entries(counts).map(([c, n]) => `${c} ${n}`).join(' · ')}`)
for (const w of warnings) console.log(`⚠ ${w}`)
for (const e of errors) console.error(`✗ ${e}`)
if (errors.length) process.exit(1)
console.log('✓ events.json e valid')
