const { DateTime } = require('luxon')

const TZ = 'America/Chicago'
function nowChi() { return DateTime.now().setZone(TZ) }
function isSunday(dt = nowChi()) { return dt.weekday === 7 }
function isSaturday(dt = nowChi()) { return dt.weekday === 6 }
function isPurgeActive(dt = nowChi()) { const h = dt.hour + dt.minute/60; return isSaturday(dt) && h >= 8 && h < 24 }
function ok(body, statusCode=200, setCookie=null) {
  const headers = { 'Content-Type':'application/json', 'Access-Control-Allow-Origin':'*' }
  if (setCookie) headers['Set-Cookie'] = setCookie
  return { statusCode, headers, body: JSON.stringify(body) }
}
function bad(msg, statusCode=400) { return ok({ error: msg }, statusCode) }

function parseCookies(cookieHeader) {
  const out = {}
  if (!cookieHeader) return out
  const parts = cookieHeader.split(';')
  for (const part of parts) {
    const [k, ...rest] = part.split('=')
    const key = (k||'').trim()
    const val = rest.join('=').trim()
    if (key) out[key] = val
  }
  return out
}

function parseAuthHeader(auth) {
  if (!auth || typeof auth !== 'string') return null
  const s = auth.trim()
  if (/^Bearer\s+/i.test(s)) return s.replace(/^Bearer\s+/i, '').trim()
  if (/^Basic\s+/i.test(s)) {
    try {
      const b64 = s.replace(/^Basic\s+/i, '').trim()
      const dec = Buffer.from(b64, 'base64').toString('utf8')
      if (dec.includes(':')) return dec.split(':',2)[1]
      return dec
    } catch { return null }
  }
  return null
}

function requireAdmin(event) {
  const headers = event.headers || {}
  // 1) Preferred: HttpOnly cookie from admin-auth
  const cookies = parseCookies(headers.cookie || headers.Cookie || '')
  if (cookies['pcs_admin'] === '1') return true

  // 2) Back-compat: allow header Authorization/x-admin with exact password
  const authHeader = headers['authorization'] || headers['Authorization']
  const headerPw = (headers['x-admin'] || headers['X-Admin'] || '').toString().trim()
  const authPw = parseAuthHeader(authHeader) || ''

  const given = (headerPw || authPw || '').trim()
  const expected = 'Slapshot2007'  // fixed per request; not exposed in UI

  if (given && given === expected) return true
  return null
}

module.exports = { TZ, nowChi, isSunday, isSaturday, isPurgeActive, ok, bad, requireAdmin }
