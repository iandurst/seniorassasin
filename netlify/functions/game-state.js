
const { ok, bad, getBase, tables, getSingletonState } = require('./_common')

exports.handler = async () => {
  try {
    const base = getBase()
    const t = tables()

    // prize pool: 5 * eliminations count
    const elims = await base(t.elims).select({}).all()
    const prizePool = elims.length * 5

    const state = await getSingletonState(base, t)

    return ok({
      prizePool,
      currentWeek: state.fields.currentWeek || 1,
      purgeStart: state.fields.purgeStart || null,
      purgeEnd: state.fields.purgeEnd || null,
    })
  } catch (e) { return bad(e.message || 'Error') }
}
