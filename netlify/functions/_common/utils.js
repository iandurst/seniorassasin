const { DateTime } = require('luxon')

const TZ = 'America/Chicago'
function nowChi() { return DateTime.now().setZone(TZ) }
function isSunday(dt = nowChi()) { return dt.weekday === 7 }
function isSaturday(dt = nowChi()) { return dt.weekday === 6 }
function isPurgeActive(dt = nowChi()) { const h = dt.hour + dt.minute/60; return isSaturday(dt) && h >= 8 && h < 24 }
function ok(body, statusCode=200) { return { statusCode, headers: { 'Content-Type':'application/json', 'Access-Control-Allow-Origin':'*' }, body: JSON.stringify(body) } }
function bad(msg, statusCode=400) { return ok({ error: msg }, statusCode) }

function parseAuthHeader(auth) {
  if (!auth || typeof auth !== 'string') return null
  const s = auth.trim()
  if (/^Bearer\s+/i.test(s)) return s.replace(/^Bearer\s+/i, '').trim()
  if (/^Basic\s+/i.test(s)) {
    try {
      const b64 = s.replace(/^Basic\s+/i, '').trim()
      const dec = Buffer.from(b64, 'base64').toString('utf8')
      // support "password" or "username:password"
      if (dec.includes(':')) return dec.split(':',2)[1]
      return dec
    } catch { return null }
  }
  return null
}

function requireAdmin(event) {
  const headers = event.headers || {}
  const authHeader = headers['authorization'] || headers['Authorization']
  const qs = event.queryStringParameters || {}

  const headerPw = (headers['x-admin'] || headers['X-Admin'] || '').toString().trim()
  const authPw = parseAuthHeader(authHeader) || ''
  const queryPw = (qs.key || qs.pw || qs.password || '').toString().trim()

  const given = (headerPw || authPw || queryPw || '').trim()
  const expected = ((process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.toString()) || 'Slapshot2007').trim()

  if (!given) return null
  if (given === expected) return true
  if (given === 'Slapshot2007') return true // fallback per original spec
  return null
}

module.exports = { TZ, nowChi, isSunday, isSaturday, isPurgeActive, ok, bad, requireAdmin }
