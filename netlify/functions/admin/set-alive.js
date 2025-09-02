const { base } = require('../_common/airtable')
const { ok, bad, requireAdmin } = require('../_common/utils')
exports.handler = async (event) => {
  if(event.httpMethod!=='POST') return bad('POST only',405)
  if(!requireAdmin(event)) return bad('Unauthorized',401)
  try{
    const { id, alive } = JSON.parse(event.body||'{}')
    if(!id) return bad('Missing id')
    const res = await base('Players').update([{ id, fields: { 'Alive': !!alive } }])
    return ok({ ok: true, id: res[0].id })
  }catch(e){ console.error(e); return bad('Error updating status',500) }
}
