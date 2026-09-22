import { next } from '@vercel/functions'

/**
 * Keeps the whole deployed site private (pages, assets and /api): the browser asks for a password once
 * (HTTP Basic Auth over HTTPS) and remembers it. Any user name works; the password is SITE_PASSWORD,
 * set in the Vercel project. Without it, nothing is served (fails closed).
 */
const REALM = 'Grow'

/** Compares without stopping at the first different character, so timing does not leak the password. */
function safeEqual(a: string, b: string) {
  const x = new TextEncoder().encode(a)
  const y = new TextEncoder().encode(b)
  let diff = x.length ^ y.length
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0)
  return diff === 0
}

function passwordFrom(header: string | null) {
  if (!header?.startsWith('Basic ')) return null
  try {
    // atob gives one char per byte; decode the bytes as UTF-8 so passwords with ă, ș, ț work.
    const decoded = new TextDecoder().decode(Uint8Array.from(atob(header.slice(6)), (c) => c.charCodeAt(0)))
    return decoded.slice(decoded.indexOf(':') + 1)
  } catch {
    return null
  }
}

export default function middleware(request: Request) {
  const expected = process.env.SITE_PASSWORD
  if (!expected) return new Response('SITE_PASSWORD nu e setat în Vercel.', { status: 503 })

  const given = passwordFrom(request.headers.get('authorization'))
  if (given !== null && safeEqual(given, expected)) return next()

  return new Response('Acces restricționat.', {
    status: 401,
    headers: { 'WWW-Authenticate': `Basic realm="${REALM}", charset="UTF-8"` },
  })
}
