const { base } = require('../_common/airtable')
const { ok, bad, nocontent, requireAdmin } = require('../_common/utils')

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return nocontent()
  if (event.httpMethod !== 'POST') return bad('POST only', 405)
  if (!requireAdmin(event)) return bad('Unauthorized', 401)
  try {
    const { id } = JSON.parse(event.body||'{}')
    if (!id) return bad('Missing id')
    // Remove eliminations where this player is eliminator or eliminated
    const byEliminator = await base('Eliminations').select({ filterByFormula: `{EliminatorId} = '${id}'` }).all()
    const byEliminated = await base('Eliminations').select({ filterByFormula: `{EliminatedId} = '${id}'` }).all()
    const toDelete = [...byEliminator, ...byEliminated].map(r => r.id)
    const chunks = (arr, size) => Array.from({length: Math.ceil(arr.length/size)}, (_,i) => arr.slice(i*size,(i+1)*size))
    for (const group of chunks(toDelete, 10)) {
      if (group.length) await base('Eliminations').destroy(group)
    }
    // Delete player
    await base('Players').destroy([id])
    return ok({ ok: true, deletedEliminations: toDelete.length })
  } catch (e) {
    console.error(e)
    return bad('Error removing player', 500)
  }
}
