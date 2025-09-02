
const { base } = require('../_common/airtable')
const { ok, bad, requireAdmin } = require('../_common/utils')

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') { const { ok } = require('../_common/utils'); return ok({ ok: true }) }
  if (event.httpMethod !== 'POST') return bad('POST only', 405)
  if (!requireAdmin(event)) return bad('Unauthorized', 401)
  try {
    const { id, verified } = JSON.parse(event.body||'{}')
    if (!id) return bad('Missing id')
    const res = await base('Players').update([{ id, fields: { 'Verified': !!verified, 'Alive': !!verified } }])
    return ok({ ok: true, id: res[0].id })
  } catch (e) {
    console.error(e)
    const code = e.response?.status
    if (code === 401) return bad('Airtable auth failed. Check AIRTABLE_API_KEY (or AIRTABLE_PAT).', 500)
    return bad('Error verifying player', 500)
  }
}
