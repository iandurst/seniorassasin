const { DateTime } = require('luxon')
const crypto = require('crypto')

const TZ = 'America/Chicago'
function nowChi() { return DateTime.now().setZone(TZ) }
function isSunday(dt = nowChi()) { return dt.weekday === 7 }
function isSaturday(dt = nowChi()) { return dt.weekday === 6 }
function isPurgeActive(dt = nowChi()) { const h = dt.hour + dt.minute/60; return isSaturday(dt) && h >= 8 && h < 24 }

function ok(body, statusCode=200, extraHeaders={}) {
  return {
    statusCode,
    headers: { 'Content-Type':'application/json', 'Access-Control-Allow-Origin':'*', ...extraHeaders },
    body: JSON.stringify(body)
  }
}
function bad(msg, statusCode=400) { return ok({ error: msg }, statusCode) }

// --- Cookie-based admin auth ---
// Fixed password, server-side only (not shown on client)
const ADMIN_PASSWORD = 'Slapshot2007'
// HMAC secret for signing session tokens (do not reveal to client)
const ADMIN_SECRET = (process.env.ADMIN_JWT_SECRET || (ADMIN_PASSWORD + ':PCS-HMAC-SHA256'))

function signToken(expMs) {
  const payload = `v1.${expMs}`
  const sig = crypto.createHmac('sha256', ADMIN_SECRET).update(payload).digest('hex')
  return `${payload}.${sig}`
}
function verifyToken(token) {
  if (!token || typeof token !== 'string') return false
  const parts = token.split('.')
  if (parts.length !== 3 || parts[0] !== 'v1') return false
  const expMs = parseInt(parts[1], 10)
  const sig = parts[2]
  const expected = crypto.createHmac('sha256', ADMIN_SECRET).update(`v1.${expMs}`).digest('hex')
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false
  if (Date.now() > expMs) return false
  return true
}
function parseCookies(header) {
  const out = {}
  if (!header) return out
  const items = header.split(';')
  // handle full Cookie: "a=b; c=d; pcs_admin=..."
  header.split(';').forEach(part => {
    const idx = part.indexOf('=')
    if (idx > -1) {
      const k = part.slice(0, idx).trim()
      const v = part.slice(idx+1).trim()
      out[k] = v
    }
  })
  return out
}

function requireAdmin(event) {
  // 1) Prefer signed session cookie
  const cookieHeader = event.headers && (event.headers.cookie || event.headers.Cookie)
  const cookies = parseCookies(cookieHeader || '')
  const token = cookies['pcs_admin']
  if (token && verifyToken(token)) return true

  // 2) Optional legacy header fallback (not used by UI)
  const given = (event.headers && (event.headers['x-admin'] || event.headers['X-Admin']) || '').toString().trim()
  if (given && given === ADMIN_PASSWORD) return true

  return null
}

module.exports = { TZ, nowChi, isSunday, isSaturday, isPurgeActive, ok, bad, requireAdmin, signToken }
