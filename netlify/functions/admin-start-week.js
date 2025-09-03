const { ok, bad, requireAdmin, nowChi } = require('./_common/utils')
const { setWeekStart } = require('./_common/settings')
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return bad('POST only', 405)
  if (!requireAdmin(event)) return bad('Unauthorized', 401)
  try {
    const iso = nowChi().toISO()
    await setWeekStart(iso)
    return ok({ ok: true, weekStart: iso })
  } catch (e) {
    console.error(e)
    return bad('Error starting week', 500)
  }
