
const { ok, bad, getBase, tables, getSingletonState } = require('./_common')

exports.handler = async () => {
  try {
    const base = getBase()
    const t = tables()
    const state = await getSingletonState(base, t)
    const week = state.fields.currentWeek || 1
    const recs = await base(t.votes).select({ filterByFormula: `{weekNumber}=${week}` }).all()
    let cont = 0, end = 0
    recs.forEach(r => {
      if (r.fields.vote === 'End') end += 1
      else cont += 1
    })
    return ok({ continue: cont, end })
  } catch (e) { return bad(e.message || 'Error') }
}
