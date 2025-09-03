
const { base } = require('./_common/airtable')
const { ok, bad } = require('./_common/utils')
exports.handler = async () => {
  try {
    const allPlayers = []
    await base('Players').select({ view:'Grid view' }).eachPage(async (records) => {
      records.forEach(r => {
        allPlayers.push({
          id: r.id, firstName: r.get('FirstName')||'', lastName: r.get('LastName')||'',
          phone: 'hidden', verified: !!r.get('Verified'), alive: r.get('Alive') !== false,
          eliminations: r.get('Eliminations') || 0,
        })
      })
    })
    const players = allPlayers.filter(p => p.verified)
    const elimCount = (await base('Eliminations').select({ pageSize:100, fields:['ID'] }).all()).length
    const prizePool = elimCount * 5
    const topPlayer = players.slice().sort((a,b)=> (b.eliminations||0) - (a.eliminations||0))[0] || null
    return ok({ players, topPlayer, totalElims: elimCount, prizePool, pendingCount: allPlayers.length - players.length })
  } catch (e) { console.error(e); return bad('Error fetching data', 500) }
}
