
const { ok, bad, getBase, tables } = require('./_common')

exports.handler = async () => {
  try {
    const base = getBase()
    const t = tables()
    const recs = await base(t.players).select({}).all()
    const players = recs.map(r => ({ id: r.id, ...r.fields }))
      .map(p => ({ id: p.id, firstName: p.firstName, lastName: p.lastName, status: p.status || 'Pending', elimCount: p.elimCount || 0 }))
      .sort((a,b) => (b.elimCount||0) - (a.elimCount||0))
    return ok({ players })
  } catch (e) {
    return bad(e.message || 'Error')
  }
}
