
const { ok, bad, getBase, tables, requireAdmin, cleanPhone } = require('./_common')

exports.handler = async (event) => {
  try {
    requireAdmin(event)
    const { eliminatorPhone, eliminatedPhone } = JSON.parse(event.body || '{}')
    const elimA = cleanPhone(eliminatorPhone)
    const elimB = cleanPhone(eliminatedPhone)
    if (!elimA || !elimB) return bad('Missing phones')
    if (elimA === elimB) return bad('Phones cannot match')
    const base = getBase()
    const t = tables()
    // find players
    const [A, B] = await Promise.all([
      base(t.players).select({ filterByFormula: `{phone}='${elimA}'`, maxRecords: 1 }).firstPage(),
      base(t.players).select({ filterByFormula: `{phone}='${elimB}'`, maxRecords: 1 }).firstPage()
    ])
    if (!A.length || !B.length) return bad('Player(s) not found')
    const a = A[0], b = B[0]
    if (!a.fields.verified || a.fields.status !== 'Alive') return bad('Eliminator not verified/alive')
    if (!b.fields.verified || b.fields.status !== 'Alive') return bad('Eliminated not verified or already out')
    // record elim
    await base(t.elims).create([{ fields: { eliminatorPhone: elimA, eliminatedPhone: elimB } }])
    // update counts & status
    await base(t.players).update([
      { id: a.id, fields: { elimCount: (a.fields.elimCount || 0) + 1 } },
      { id: b.id, fields: { status: 'Eliminated' } }
    ])
    return ok({ message: 'Recorded' })
  } catch (e) { return bad(e.message || 'Error') }
}
