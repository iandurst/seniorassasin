const { CFG_PHONE, CFG_LNAME } = require('./_common/settings')
const { base } = require('./_common/airtable')
const { ok, bad, requireAdmin } = require('./_common/utils')
exports.handler = async (event) => {
  if (!requireAdmin(event)) return bad('Unauthorized', 401)
  try {
    const players = []
    await base('Players').select({ view: 'Grid view' }).eachPage(async (records) => {
      records.forEach(r => players.push({
        id: r.id,
        firstName: r.get('FirstName') || '',
        lastName: r.get('LastName') || '',
        phone: r.get('Phone') || '',
        verified: !!r.get('Verified'),
        alive: r.get('Alive') !== false,
        eliminations: r.get('Eliminations') || 0,
      }))
    })
    const elimCount = (await base('Eliminations').select({ pageSize: 100 }).all()).length
    const prizePool = elimCount * 5
    const visible = players.filter(p => !(p.phone === CFG_PHONE && p.lastName === CFG_LNAME))
    return ok({ players: visible, prizePool, totalElims: elimCount })
  } catch (e) { console.error(e); return bad('Error listing players', 500) }
}
