// Validates the Learning content written by the /learning-daily skill:
//   src/content/learning/days/<YYYY-MM-DD>.json  one day's plan (3 lessons)
//   src/content/learning/library.json             evergreen lessons from before the daily plan
//   src/content/learning/history.json             titles already used, so topics do not repeat
// `--fix` also normalizes what a script can decide: ids, reading time, video details from YouTube, dead videos removed,
// and days older than KEEP_DAYS archived (their titles move into history.json, the file is deleted; git keeps it).
// Exit code 1 when something needs a human or the skill.
import { existsSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const DIR = join(ROOT, 'src/content/learning')
const DAYS_DIR = join(DIR, 'days')
const FIX = process.argv.includes('--fix')
const KEEP_DAYS = 60
const LESSONS_PER_DAY = 3
const WORDS = { min: 170, max: 330 }

const areasSource = readFileSync(join(ROOT, 'src/features/learning/areas.ts'), 'utf8')
const areaIds = [...areasSource.matchAll(/id: '([\w-]+)'/g)].map((m) => m[1])
const socialStepCount = (areasSource.match(/export const socialSteps = \[([\s\S]*?)\]/)?.[1].match(/'/g)?.length ?? 0) / 2

const errors = []
const warnings = []
const infos = []
const isText = (v) => typeof v === 'string' && v.trim().length > 0
const isDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v ?? '') && new Date(`${v}T00:00:00Z`).toISOString().startsWith(v)
const countWords = (parts) => parts.join(' ').split(/\s+/).filter(Boolean).length
/** Body words: what the length target applies to. */
const wordCount = (a) => countWords([a.hook, a.coreIdea, ...(a.sections ?? []).map((s) => s.body), a.example])
/** Everything the reader sees, for the reading time. */
const readingWords = (a) =>
  wordCount(a) + countWords([...(a.sections ?? []).map((s) => s.heading), ...(a.takeaways ?? []), a.tryToday, a.quiz?.question, a.quiz?.answer])

const readJson = (path, where) => {
  try {
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch (e) {
    errors.push(`${where}: JSON invalid (${e.message})`)
    return null
  }
}
const writeJson = (path, data) => writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`)

const VIDEO_ID = /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/
async function lookupVideo(video) {
  const videoId = video.videoId ?? VIDEO_ID.exec(video.url ?? '')?.[1]
  if (!videoId) return null
  const watch = `https://www.youtube.com/watch?v=${videoId}`
  try {
    const res = await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(watch)}`, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) return null
    const data = await res.json()
    return { videoId, title: data.title ?? video.title ?? 'Video', channel: data.author_name ?? '' }
  } catch {
    return undefined // network problem: unknown, not dead
  }
}

/** Checks one lesson; with --fix fills id (when `id` is given), reading time and videos. */
async function checkLesson(a, at, { id, strictLength }) {
  for (const field of ['title', 'hook', 'coreIdea', 'example', 'tryToday']) if (!isText(a[field])) errors.push(`${at}: lipsește ${field}`)
  if (!areaIds.includes(a.areaId)) errors.push(`${at}: areaId "${a.areaId}" nu e în areas.ts`)
  if (a.step !== undefined && (a.areaId !== 'social' || !Number.isInteger(a.step) || a.step < 1 || a.step > socialStepCount))
    errors.push(`${at}: step e doar pentru social, între 1 și ${socialStepCount}`)
  if (a.eventTitle !== undefined && !isText(a.eventTitle)) errors.push(`${at}: eventTitle trebuie să fie text sau să lipsească`)
  if (!Array.isArray(a.sections) || a.sections.length < 2 || a.sections.length > 3 || !a.sections.every((s) => isText(s.heading) && isText(s.body)))
    errors.push(`${at}: sections trebuie să aibă 2 sau 3 elemente cu heading și body`)
  for (const s of a.sections ?? []) {
    if (s.code !== undefined && !isText(s.code)) errors.push(`${at}: code trebuie să fie text sau să lipsească`)
    if (isText(s.code) && s.code.split('\n').length > 15) warnings.push(`${at}: exemplul de cod are peste 15 linii`)
  }
  if (!Array.isArray(a.takeaways) || a.takeaways.length !== 3 || !a.takeaways.every(isText)) errors.push(`${at}: takeaways trebuie să aibă exact 3 texte`)
  if (!isText(a.quiz?.question) || !isText(a.quiz?.answer)) errors.push(`${at}: quiz are nevoie de question și answer`)
  if (!Array.isArray(a.sources) || a.sources.length === 0) errors.push(`${at}: cel puțin o sursă`)
  for (const s of a.sources ?? []) if (!isText(s.title) || !/^https?:\/\//.test(s.url ?? '')) errors.push(`${at}: sursă invalidă ${JSON.stringify(s)}`)
  if (!Array.isArray(a.videos)) a.videos = []
  if (a.videos.length > 1) errors.push(`${at}: maximum 1 video`)

  const words = wordCount(a)
  if (strictLength && (words < WORDS.min || words > WORDS.max)) warnings.push(`${at}: ${words} cuvinte (ținta e 200–280)`)

  const checked = await Promise.all(a.videos.map(lookupVideo))
  const kept = []
  checked.forEach((result, j) => {
    const original = a.videos[j]
    if (result === null) (FIX ? warnings : errors).push(`${at}: video inexistent sau neîncorporabil ${original.url ?? original.videoId}${FIX ? ' (scos)' : ''}`)
    else if (result === undefined) {
      warnings.push(`${at}: nu am putut verifica video-ul ${original.url ?? original.videoId} (rețea)`)
      if (original.videoId) kept.push(original)
    } else {
      kept.push(result)
      infos.push(`${at}: video „${result.title}” de pe canalul ${result.channel}`)
    }
  })

  if (FIX) {
    if (id) a.id = id
    a.readingMinutes = Math.max(1, Math.ceil(readingWords(a) / 200))
    a.videos = kept
  } else {
    if (!isText(a.id)) errors.push(`${at}: lipsește id (rulează cu --fix)`)
    if (!Number.isInteger(a.readingMinutes)) errors.push(`${at}: lipsește readingMinutes (rulează cu --fix)`)
    if (a.videos.some((v) => !v.videoId)) errors.push(`${at}: video fără videoId (rulează cu --fix)`)
  }
}

const LESSON_KEYS = ['id', 'areaId', 'title', 'hook', 'coreIdea', 'sections', 'example', 'takeaways', 'tryToday', 'quiz', 'videos', 'sources', 'readingMinutes', 'step', 'eventTitle']
const ordered = (a) => Object.fromEntries(LESSON_KEYS.filter((k) => a[k] !== undefined).map((k) => [k, a[k]]))

// History: titles already used.
const historyPath = join(DIR, 'history.json')
const history = existsSync(historyPath) ? (readJson(historyPath, 'history.json') ?? { titles: [] }) : { titles: [] }
if (!Array.isArray(history.titles)) history.titles = []

// Days, newest first; the oldest beyond KEEP_DAYS are archived.
const dayFiles = (existsSync(DAYS_DIR) ? readdirSync(DAYS_DIR) : []).filter((f) => f.endsWith('.json')).sort().reverse()
const cutoff = new Date(Date.now() - KEEP_DAYS * 86400000).toISOString().slice(0, 10)
const lessonTitles = new Map()
const seenTitle = (title, at) => {
  if (!isText(title)) return
  if (lessonTitles.has(title)) errors.push(`${at}: titlu repetat, deja folosit la ${lessonTitles.get(title)}`)
  lessonTitles.set(title, at)
}

let archived = 0
for (const file of dayFiles) {
  const where = `learning/days/${file}`
  const path = join(DAYS_DIR, file)
  const day = readJson(path, where)
  if (!day) continue
  if (!isDate(day.date) || `${day.date}.json` !== file) errors.push(`${where}: date trebuie să fie YYYY-MM-DD și egal cu numele fișierului`)
  if (FIX && isDate(day.date) && day.date < cutoff) {
    history.titles.unshift(...(day.lessons ?? []).map((l) => l.title).filter(isText))
    unlinkSync(path)
    archived++
    continue
  }
  if (!Array.isArray(day.lessons) || day.lessons.length !== LESSONS_PER_DAY) errors.push(`${where}: trebuie exact ${LESSONS_PER_DAY} lecții`)
  const areas = (day.lessons ?? []).map((l) => l.areaId)
  if (new Set(areas).size !== areas.length) errors.push(`${where}: fiecare lecție dintr-o zi e din altă arie`)
  await Promise.all((day.lessons ?? []).map((l, i) => checkLesson(l, `${where} lecția ${i + 1}`, { id: `${day.date}-${l.areaId}`, strictLength: true })))
  ;(day.lessons ?? []).forEach((l, i) => seenTitle(l.title, `${where} lecția ${i + 1}`))
  if (FIX) writeJson(path, { date: day.date, lessons: day.lessons.map(ordered) })
}

// Library: evergreen lessons, ids kept as they are.
const libraryPath = join(DIR, 'library.json')
if (existsSync(libraryPath)) {
  const library = readJson(libraryPath, 'library.json')
  if (library) {
    if (!Array.isArray(library.lessons)) errors.push('library.json: lessons trebuie să fie o listă')
    await Promise.all((library.lessons ?? []).map((l, i) => checkLesson(l, `library.json lecția ${i + 1}`, { id: l.id ?? `library-${l.areaId}-${i + 1}`, strictLength: false })))
    ;(library.lessons ?? []).forEach((l, i) => seenTitle(l.title, `library.json lecția ${i + 1}`))
    if (FIX) writeJson(libraryPath, { lessons: library.lessons.map(ordered) })
  }
}

// A new day must not reuse a title from history (library titles are in history too, and are allowed to match themselves).
const libraryTitles = new Set(existsSync(libraryPath) ? (JSON.parse(readFileSync(libraryPath, 'utf8')).lessons ?? []).map((l) => l.title) : [])
for (const [title, at] of lessonTitles) if (!libraryTitles.has(title) && history.titles.includes(title)) errors.push(`${at}: titlul „${title}” e deja în history.json`)

if (FIX) writeJson(historyPath, { titles: [...new Set(history.titles)] })

if (dayFiles.length === 0) warnings.push('nu există încă nicio zi în learning/days/')
for (const i of infos) console.log(`ℹ  ${i}`)
for (const w of warnings) console.log(`⚠  ${w}`)
for (const e of errors) console.log(`✖  ${e}`)
console.log(
  errors.length
    ? `\n${errors.length} erori de rezolvat.`
    : `\n✔ Conținut valid (${dayFiles.length - archived} zile${archived ? `, ${archived} arhivate` : ''}${FIX ? ', normalizat' : ''}).`,
)
process.exit(errors.length ? 1 : 0)
