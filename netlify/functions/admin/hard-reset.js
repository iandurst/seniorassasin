
const { base } = require('../_common/airtable')
const { ok, bad, requireAdmin } = require('../_common/utils')

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return bad('POST only', 405)
  if (!requireAdmin(event)) return bad('Unauthorized', 401)
  try {
    const chunks = (arr, size) => Array.from({length: Math.ceil(arr.length/size)}, (_,i) => arr.slice(i*size,(i+1)*size))
    for (const tbl of ['Eliminations','Votes','Players']) {
      const rows = await base(tbl).select().all()
      for (const group of chunks(rows, 10)) {
        await base(tbl).destroy(group.map(r => r.id))
      }
    }
    return ok({ ok: true })
  } catch (e) {
    console.error(e)
    const code = e.response?.status
    if (code === 401) return bad('Airtable auth failed. Check AIRTABLE_API_KEY (or AIRTABLE_PAT).', 500)
    return bad('Error hard reset', 500)
  }
}
