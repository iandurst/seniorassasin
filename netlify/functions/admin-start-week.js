const { base } = require('./_common/airtable')
const { ok, bad, requireAdmin, nowChi } = require('./_common/utils')

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return bad('POST only', 405)
  if (!requireAdmin(event)) return bad('Unauthorized', 401)
  try {
    // Upsert a single Settings row with WeekStart
    const rows = await base('Settings').select().firstPage().catch((e)=>{
      const code = e?.response?.status
      if (code === 404 || code === 422) {
        throw new Error('Missing Airtable table/field. Create a table named "Settings" with a field "WeekStart" (Date/Time).')
      }
      throw e
    })
    if (rows.length) {
      await base('Settings').update([{ id: rows[0].id, fields: { 'WeekStart': nowChi().toISO() } }])
    } else {
      await base('Settings').create({ 'WeekStart': nowChi().toISO() })
    }
    return ok({ ok: true })
  } catch (e) {
    const msg = e?.message || 'Error starting week'
    return bad(msg, 500)
  }
}
