
const { ok, bad, getBase, tables, requireAdmin, getSingletonState, DateTime, TZ } = require('./_common')

exports.handler = async (event) => {
  try {
    requireAdmin(event)
    const base = getBase()
    const t = tables()
    const state = await getSingletonState(base, t)
    const currentWeek = (state.fields.currentWeek || 0) + 1
    // compute upcoming Saturday based on now
    const now = DateTime.now().setZone(TZ)
    const saturday = now.set({ weekday: 6 }).startOf('day')
    const purgeStart = saturday.plus({ hours: 8 })
    const purgeEnd = saturday.endOf('day')
    await base(t.state).update([{
      id: state.id,
      fields: {
        key: 'state',
        currentWeek,
        weekStart: now.toISO(),
        purgeStart: purgeStart.toISO(),
        purgeEnd: purgeEnd.toISO()
      }
    }])
    return ok({ message: 'Week started', currentWeek })
  } catch (e) { return bad(e.message || 'Error') }
}
