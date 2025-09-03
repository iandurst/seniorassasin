
const { base } = require('../_common/airtable')
const { ok, bad, requireAdmin } = require('../_common/utils')

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return bad('POST only', 405)
  if (!requireAdmin(event)) return bad('Unauthorized', 401)
  try {
    const { id } = JSON.parse(event.body || '{}')
    if (!id) return bad('Missing id')
    const filter = `OR({EliminatorId} = '${id}', {EliminatedId} = '${id}')`
    const related = await base('Eliminations').select({ filterByFormula: filter }).all()
    const chunks = (arr, size) => Array.from({length: Math.ceil(arr.length/size)}, (_,i) => arr.slice(i*size,(i+1)*size))
    for (const group of chunks(related, 10)) {
      await base('Eliminations').destroy(group.map(r => r.id))
    }
    await base('Players').destroy([id])
    return ok({ ok: true })
  } catch (e) {
    console.error(e)
    return bad('Error removing player', 500)
  }
}
