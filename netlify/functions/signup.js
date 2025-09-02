
const { ok, bad, isOptions, cleanPhone, getBase, tables } = require('./_common')

exports.handler = async (event) => {
  if (isOptions(event)) return ok({})
  try {
    const { firstName, lastName, phone } = JSON.parse(event.body || '{}')
    if (!firstName || !lastName || !phone) return bad('Missing fields')
    const p = cleanPhone(phone)
    const base = getBase()
    const t = tables()
    // prevent duplicates by phone
    const existing = await base(t.players).select({ filterByFormula: `{phone}='${p}'`, maxRecords: 1 }).firstPage()
    if (existing.length) return ok({ message: 'Already signed up. Await verification.' })
    await base(t.players).create([{
      fields: {
        firstName, lastName, phone: p, verified: false, status: 'Pending', elimCount: 0
      }
    }])
    return ok({ message: 'Signup submitted' })
  } catch (e) {
    return bad(e.message || 'Error')
  }
}
