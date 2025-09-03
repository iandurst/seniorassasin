
const { base } = require('../_common/airtable')
const { ok, bad, requireAdmin } = require('../_common/utils')

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return bad('POST only', 405)
  if (!requireAdmin(event)) return bad('Unauthorized', 401)
  try {
    const { eliminatorId, eliminatedId } = JSON.parse(event.body||'{}')
    if (!eliminatorId || !eliminatedId) return bad('Missing ids')
    if (eliminatorId === eliminatedId) return bad('Cannot eliminate self')
    await base('Players').update([{ id: eliminatedId, fields: { 'Alive': false } }])
    await base('Eliminations').create({
      'EliminatorId': eliminatorId,
      'EliminatedId': eliminatedId,
      'Timestamp': new Date().toISOString()
    })
    const er = await base('Players').find(eliminatorId)
    const current = er.get('Eliminations') || 0
    await base('Players').update([{ id: eliminatorId, fields: { 'Eliminations': current + 1 } }])
    return ok({ ok: true })
  } catch (e) {
    console.error(e); return bad('Error recording elimination', 500)
  }
}
