
const { ok, bad, getBase, tables, requireAdmin } = require('./_common')

async function deleteAll(base, table) {
  const recs = await base(table).select({ pageSize: 100 }).all()
  if (!recs.length) return
  for (let i = 0; i < recs.length; i += 10) {
    const batch = recs.slice(i, i+10)
    await base(table).destroy(batch.map(r => r.id))
  }
}

exports.handler = async (event) => {
  try {
    requireAdmin(event)
    const base = getBase()
    const t = tables()
    // Reset players to Pending, zero elims
    const players = await base(t.players).select({}).all()
    for (let i=0;i<players.length;i+=10) {
      const batch = players.slice(i,i+10).map(r => ({ id: r.id, fields: { verified: false, status: 'Pending', elimCount: 0 } }))
      if (batch.length) await base(t.players).update(batch)
    }
    // Clear eliminations & votes
    await deleteAll(base, t.elims)
    await deleteAll(base, t.votes)
    return ok({ message: 'All data reset' })
  } catch (e) { return bad(e.message || 'Error') }
}
