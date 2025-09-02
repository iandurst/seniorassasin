
const { base } = require('./_common/airtable')
const { ok, bad, isSunday } = require('./_common/utils')

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return bad('POST only', 405)
  try {
    if (!base) return bad('Airtable not configured', 500)
    // Only on Sunday
    if (!isSunday()) return bad('Voting is only open on Sundays (America/Chicago)', 403)

    const { phone, choice } = JSON.parse(event.body||'{}')
    if (!/^\d{10}$/.test(phone)) return bad('Phone must be 10 digits')
    if (!['continue','end'].includes(choice)) return bad('Invalid choice')

    const players = await base('Players').select({ filterByFormula: `{Phone} = '${phone}'` }).firstPage()
    if (!players.length) return bad('Not registered')
    const p = players[0]
    if (!p.get('Verified')) return bad('Player not verified yet')

    await base('Votes').create({
      'PlayerPhone': phone,
      'Choice': choice,
      'Timestamp': new Date().toISOString()
    })

    return ok({ ok: true })
  } catch (e) {
    console.error(e)
    return bad('Error saving vote', 500)
  }
}
