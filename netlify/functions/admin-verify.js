
const { ok, bad, getBase, tables, requireAdmin, cleanPhone } = require('./_common')

exports.handler = async (event) => {
  try {
    requireAdmin(event)
    const { phone, verified, status } = JSON.parse(event.body || '{}')
    const p = cleanPhone(phone)
    const base = getBase()
    const t = tables()
    const recs = await base(t.players).select({ filterByFormula: `{phone}='${p}'`, maxRecords: 1 }).firstPage()
    if (!recs.length) return bad('Player not found')
    const id = recs[0].id
    await base(t.players).update([{ id, fields: { verified: !!verified, status: status || (verified ? 'Alive' : 'Pending') } }])
    return ok({ message: 'Updated' })
  } catch (e) {
    return bad(e.message || 'Error')
  }
}
