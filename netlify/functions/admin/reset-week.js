
const { base } = require('../_common/airtable')
const { ok, bad, requireAdmin } = require('../_common/utils')

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return bad('POST only', 405)
  if (!requireAdmin(event)) return bad('Unauthorized', 401)
  try {
    const verifiedPlayers = await base('Players').select({ filterByFormula: "{Verified} = TRUE()" }).all()
    const chunks = (arr, size) => Array.from({length: Math.ceil(arr.length/size)}, (_,i) => arr.slice(i*size,(i+1)*size))
    for (const group of chunks(verifiedPlayers, 10)) {
      await base('Players').update(group.map(r => ({ id: r.id, fields: { 'Alive': true, 'Eliminations': 0 } })))
    }
    const allElims = await base('Eliminations').select().all()
    for (const group of chunks(allElims, 10)) {
      await base('Eliminations').destroy(group.map(r => r.id))
    }
    const votes = await base('Votes').select().all()
    for (const group of chunks(votes, 10)) {
      await base('Votes').destroy(group.map(r => r.id))
    }
    return ok({ ok: true })
  } catch (e) {
    console.error(e)
    const code = e.response?.status
    if (code === 401) return bad('Airtable auth failed. Check AIRTABLE_API_KEY (or AIRTABLE_PAT).', 500)
    return bad('Error resetting week', 500)
  }
}
