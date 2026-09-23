// Validates src/content/fashion/style.json (written by the /fashion-refresh skill).
// `--fix` fills missing ids from titles and sorts outfits by occasion. Exit code 1 when something needs a human.
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const FILE = join(ROOT, 'src/content/fashion/style.json')
const FIX = process.argv.includes('--fix')
const KINDS = ['magazin', 'online']
const MIN = { rules: 5, wardrobe: 10, outfits: 5, trends: 3, shops: 5 }

const occasionIds = [...readFileSync(join(ROOT, 'src/features/fashion/occasions.ts'), 'utf8').matchAll(/id: '([\w-]+)'/g)].map((m) => m[1])

const errors = []
const warnings = []
const isText = (v) => typeof v === 'string' && v.trim().length > 0
const isUrl = (v) => /^https:\/\//.test(v ?? '')
const slug = (s) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40).replace(/-$/, '')

async function urlStatus(url) {
  try {
    const res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(10000), headers: { 'user-agent': 'Mozilla/5.0 (fashion:check)' } })
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

const ids = new Map()
const fillId = (entry, at, from) => {
  if (!isText(entry.id) && isText(from)) {
    if (FIX) entry.id = slug(from)
    else errors.push(`${at}: lipsește id (rulează cu --fix)`)
  }
  if (isText(entry.id)) {
    const key = `${at.split(' ')[0]}:${entry.id}`
    if (ids.has(key)) errors.push(`${at}: id repetat "${entry.id}"`)
    ids.set(key, at)
  }
}

const urls = []
const checkFields = (entry, at, fields) => {
  for (const field of fields) if (!isText(entry[field])) errors.push(`${at}: lipsește ${field}`)
}

const shopIds = new Set(data.shops.map((s) => s.id))
for (const [i, shop] of data.shops.entries()) {
  const at = `shops ${i + 1} (${shop.name ?? '?'})`
  checkFields(shop, at, ['name', 'what'])
  fillId(shop, at, shop.name)
  if (!KINDS.includes(shop.kind)) errors.push(`${at}: kind trebuie să fie ${KINDS.join(' sau ')}`)
  if (shop.kind === 'magazin' && !isText(shop.address)) errors.push(`${at}: un magazin fizic are nevoie de address`)
  if (!isUrl(shop.url)) errors.push(`${at}: url trebuie să înceapă cu https://`)
  else urls.push([at, shop.url])
}

for (const [i, rule] of data.rules.entries()) {
  const at = `rules ${i + 1} (${rule.title ?? '?'})`
  checkFields(rule, at, ['title', 'body', 'tip'])
  fillId(rule, at, rule.title)
}

for (const [i, item] of data.wardrobe.entries()) {
  const at = `wardrobe ${i + 1} (${item.name ?? '?'})`
  checkFields(item, at, ['name', 'layer', 'why', 'lookFor', 'price'])
  fillId(item, at, item.name)
  if (!Array.isArray(item.brands) || item.brands.length === 0) errors.push(`${at}: cel puțin un brand`)
  if (!Array.isArray(item.shopIds) || item.shopIds.length === 0) errors.push(`${at}: cel puțin un magazin`)
  for (const id of item.shopIds ?? []) if (!shopIds.has(id)) errors.push(`${at}: shopId necunoscut "${id}"`)
  if (!/\d/.test(item.price ?? '')) errors.push(`${at}: price trebuie să conțină cifre, ca „250–450 lei”`)
  if (item.url !== undefined) {
    if (!isUrl(item.url)) errors.push(`${at}: url trebuie să înceapă cu https://`)
    else urls.push([at, item.url])
  }
}

for (const [i, outfit] of data.outfits.entries()) {
  const at = `outfits ${i + 1} (${outfit.name ?? '?'})`
  checkFields(outfit, at, ['name', 'why'])
  fillId(outfit, at, outfit.name)
  if (!occasionIds.includes(outfit.occasion)) errors.push(`${at}: occasion "${outfit.occasion}" nu e în occasions.ts`)
  if (!Array.isArray(outfit.pieces) || outfit.pieces.length < 3) errors.push(`${at}: cel puțin 3 piese`)
  if (outfit.avoid !== undefined && !isText(outfit.avoid)) errors.push(`${at}: avoid trebuie să fie text sau să lipsească`)
}
for (const id of occasionIds) if (!data.outfits.some((o) => o.occasion === id)) warnings.push(`nicio ținută pentru ocazia "${id}"`)

for (const [i, trend] of data.trends.entries()) {
  const at = `trends ${i + 1} (${trend.title ?? '?'})`
  checkFields(trend, at, ['title', 'body', 'howToWear'])
  fillId(trend, at, trend.title)
  if (!isText(trend.source?.title) || !isUrl(trend.source?.url)) errors.push(`${at}: source are nevoie de title și url https`)
  else urls.push([at, trend.source.url])
}

await Promise.all(
  urls.map(async ([at, url]) => {
    const status = await urlStatus(url)
    if (status === 404 || status === 410) errors.push(`${at}: URL mort (${status}) ${url}`)
    else if (status === undefined) warnings.push(`${at}: URL neverificat (rețea sau blocat) ${url}`)
  }),
)

if (FIX) {
  data.outfits.sort((a, b) => occasionIds.indexOf(a.occasion) - occasionIds.indexOf(b.occasion))
  writeFileSync(FILE, `${JSON.stringify(data, null, 2)}\n`)
}

console.log(`style.json: ${data.rules.length} reguli · ${data.wardrobe.length} piese · ${data.outfits.length} ținute · ${data.trends.length} trenduri · ${data.shops.length} magazine`)
for (const w of warnings) console.log(`⚠  ${w}`)
for (const e of errors) console.log(`✖  ${e}`)
if (errors.length) process.exit(1)
console.log('✔ style.json e valid')
