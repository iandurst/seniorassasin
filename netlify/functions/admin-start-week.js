const { base } = require('./_common/airtable')
const { ok, bad, requireAdmin, nowChi } = require('./_common/utils')
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return bad('POST only', 405)
  if (!requireAdmin(event)) return bad('Unauthorized', 401)
  try {
    const rows = await base('Settings').select().firstPage().catch(()=>[])
    if (rows.length) await base('Settings').update([{ id: rows[0].id, fields: { 'WeekStart': nowChi().toISO() } }])
    else await base('Settings').create({ 'WeekStart': nowChi().toISO() })
    return ok({ ok:true })
  } catch (e) { console.error(e); return bad('Error starting week', 500) }
}
