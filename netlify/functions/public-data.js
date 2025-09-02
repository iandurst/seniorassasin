
const { base } = require('./_common/airtable')
const { ok, bad } = require('./_common/utils')

exports.handler = async (event) => {
  try {
    if (!base) return bad('Airtable not configured', 500)
    const players = []
    await base('Players').select({ view: 'Grid view' }).eachPage((records, fetchNextPage) => {
      records.forEach(r => {
        players.push({
          id: r.id,
          firstName: r.get('FirstName') || '',
          lastName: r.get('LastName') || '',
          phone: 'hidden',
          verified: !!r.get('Verified'),
          alive: r.get('Alive') !== false,
          eliminations: r.get('Eliminations') || 0,
        })
      })
      fetchNextPage()
    })

    const elimCount = await base('Eliminations').select({ pageSize: 100, fields: ['ID'] }).all().then(arr => arr.length).catch(()=>0)
    const prizePool = elimCount * 5

    const topPlayer = players.slice().sort((a,b)=> (b.eliminations||0)-(a.eliminations||0))[0] || null

    return ok({ players, topPlayer, totalElims: elimCount, prizePool })
  } catch (e) {
    console.error(e)
    return bad('Error fetching data', 500)
  }
}
