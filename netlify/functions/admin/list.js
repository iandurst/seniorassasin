
const { base } = require('../_common/airtable')
const { ok, bad, requireAdmin } = require('../_common/utils')

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
    const elimCount = (await base('Eliminations').select({ pageSize: 100, fields: ['ID'] }).all()).length
    const prizePool = elimCount * 5
    return ok({ players, prizePool, totalElims: elimCount })
  } catch (e) {
    console.error(e)
    const code = e.response?.status
    if (code === 401) return bad('Airtable auth failed. Check AIRTABLE_API_KEY (or AIRTABLE_PAT).', 500)
    return bad('Error listing players', 500)
  }
}
