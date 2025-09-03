const { base } = require('./_common/airtable')
const { ok, bad, requireAdmin } = require('./_common/utils')
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return bad('POST only', 405)
  if (!requireAdmin(event)) return bad('Unauthorized', 401)
  try {
    const chunks = (arr,size)=>Array.from({length:Math.ceil(arr.length/size)},(_,i)=>arr.slice(i*size,(i+1)*size))
    for (const tbl of ['Eliminations','Votes','Players']) { const rows=await base(tbl).select().all(); for (const g of chunks(rows,10)) await base(tbl).destroy(g.map(r=>r.id)) }
    return ok({ ok:true })
  } catch (e) { console.error(e); return bad('Error hard reset', 500) }
}
