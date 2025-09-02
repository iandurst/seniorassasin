
const { base } = require('../_common/airtable')
const { ok, bad, requireAdmin } = require('../_common/utils')

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return bad('POST only', 405)
  if (!requireAdmin(event)) return bad('Unauthorized', 401)
  try {
    // Reset Players (keep records, clear flags & counts)
    const players = await base('Players').select().all()
    const chunks = (arr, size) => Array.from({length: Math.ceil(arr.length/size)}, (_,i) => arr.slice(i*size,(i+1)*size))
    for (const group of chunks(players, 10)) {
      await base('Players').update(group.map(r => ({ id: r.id, fields: { 'Verified': false, 'Alive': false, 'Eliminations': 0 } })))
    }

    // Clear Eliminations and Votes
    const elim = await base('Eliminations').select().all()
    for (const group of chunks(elim, 10)) {
      await base('Eliminations').destroy(group.map(r => r.id))
    }
    const votes = await base('Votes').select().all()
    for (const group of chunks(votes, 10)) {
      await base('Votes').destroy(group.map(r => r.id))
    }

    // Clear Settings (WeekStart)
    const settings = await base('Settings').select().all().catch(()=>[])
    for (const group of chunks(settings, 10)) {
      await base('Settings').destroy(group.map(r => r.id))
    }

    return ok({ ok: true })
  } catch (e) {
    console.error(e)
    return bad('Error resetting all game data', 500)
  }
}
