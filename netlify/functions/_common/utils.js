const { DateTime } = require('luxon')
const TZ='America/Chicago'
function nowChi(){ return DateTime.now().setZone(TZ) }
function isSunday(dt=nowChi()){ return dt.weekday===7 }
function isSaturday(dt=nowChi()){ return dt.weekday===6 }
function isPurgeActive(dt=nowChi()){ const h=dt.hour+dt.minute/60; return isSaturday(dt)&&h>=8&&h<24 }
function ok(body, statusCode=200){ return { statusCode, headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}, body: JSON.stringify(body) } }
function bad(msg, statusCode=400){ return ok({ error: msg }, statusCode) }
function requireAdmin(event){
  const given = event.headers['x-admin'] || event.headers['X-Admin'] || (event.queryStringParameters ? event.queryStringParameters.key : '')
  const expected = process.env.ADMIN_PASSWORD || 'Slapshot2007'
  if(given!==expected) return null
  return true
}
module.exports={ TZ, nowChi, isSunday, isSaturday, isPurgeActive, ok, bad, requireAdmin }
