
const { getAssignments } = require('./db');
exports.handler = async (event) => {
  try{
    const secret = event.headers['x-admin-secret'] || event.headers['X-Admin-Secret'];
    if (!process.env.ADMIN_PASSWORD || secret !== process.env.ADMIN_PASSWORD) return j(401, { ok:false, error:'unauthorized' });
    const url = new URL(event.rawUrl || ('https://x/?'+(event.rawQuery || '')));
    const week = Number(url.searchParams.get('week') || 0);
    if (!week) return j(400, { ok:false, error:'week required' });
    const data = await getAssignments(week);
    if (!data) return j(404, { ok:false, error:'No assignments for this week' });
    return j(200, { ok:true, week, pairs: data.pairs || [], createdAt: data.createdAt || null });
  }catch(e){
    return j(500, { ok:false, error: e.message });
  }
};
const j = (s,b)=>({ statusCode:s, headers:{'content-type':'application/json'}, body: JSON.stringify(b, null, 2) });
