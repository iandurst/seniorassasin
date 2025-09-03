
const { DateTime } = require('luxon')
const crypto = require('crypto')

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

// Token helpers
const SECRET = (process.env.ADMIN_TOKEN_SECRET || 'pcs-admin-secret-2025').toString()
function signToken(payload, ttlSeconds = 6 * 60 * 60) {
  const exp = Math.floor(Date.now()/1000) + ttlSeconds
  const body = Buffer.from(JSON.stringify({ ...payload, exp })).toString('base64url')
  const sig = crypto.createHmac('sha256', SECRET).update(body).digest('base64url')
  return `v1.${body}.${sig}`
}
function verifyToken(token) {
  if (!token || typeof token !== 'string') return false
  const parts = token.split('.')
  if (parts.length !== 3 || parts[0] !== 'v1') return false
  const [ , body, sig ] = parts
  const expect = crypto.createHmac('sha256', SECRET).update(body).digest('base64url')
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expect))) return false
  try {
    const json = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'))
    if (typeof json.exp !== 'number') return false
    if (json.exp < Math.floor(Date.now()/1000)) return false
    return true
  } catch { return false }
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
  const authorization = headers['authorization'] || headers['Authorization']
  const bearer = parseAuthHeader(authorization)
  if (bearer && verifyToken(bearer)) return true
  const headerPw = (headers['x-admin'] || headers['X-Admin'] || '').toString().trim()
  const expected = 'Slapshot2007'
  if (headerPw && headerPw === expected) return true
  return null
}

module.exports = { TZ, nowChi, isSunday, isSaturday, isPurgeActive, ok, bad, signToken, verifyToken, requireAdmin }
