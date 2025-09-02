
const { ok, bad, getBase, tables, cleanPhone, DateTime, TZ, getSingletonState } = require('./_common')

function isSundayNow() {
  const now = DateTime.now().setZone(TZ)
  return now.weekday === 7
}

exports.handler = async (event) => {
  try {
    const { phone, vote } = JSON.parse(event.body || '{}')
    const p = cleanPhone(phone)
    if (!p || !vote) return bad('Missing fields')

    const base = getBase()
    const t = tables()
    const state = await getSingletonState(base, t)
    const week = state.fields.currentWeek || 1

    // Ensure player exists and is verified
    const recs = await base(t.players).select({ filterByFormula: `{phone}='${p}'`, maxRecords: 1 }).firstPage()
    if (!recs.length) return bad('Player not found')
    const player = recs[0]
    if (!player.fields.verified) return bad('Player not verified')

    // Restrict to Sundays unless ALLOW_VOTE_ANYDAY set
    if (process.env.ALLOW_VOTE_ANYDAY !== 'true' && !isSundayNow()) {
      return bad('Voting only available on Sundays (America/Chicago)')
    }

    // Allow one vote per player per week
    const exists = await base(t.votes).select({ filterByFormula: `AND({playerPhone}='${p}', {weekNumber}=${week})`, maxRecords: 1 }).firstPage()
    if (exists.length) return ok({ message: 'Vote updated' })

    await base(t.votes).create([{ fields: { playerPhone: p, weekNumber: week, vote: vote === 'End' ? 'End' : 'Continue' } }])
    return ok({ message: 'Vote recorded' })
  } catch (e) { return bad(e.message || 'Error') }
}
