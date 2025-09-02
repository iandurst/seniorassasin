
// /.netlify/functions/admin-targets — get assignments for a week (auth required)
const { getAssignments } = require('./db');

exports.handler = async (event) => {
  try{
    const secret = event.headers['x-admin-secret'] || event.headers['X-Admin-Secret'];
    if (!process.env.ADMIN_PASSWORD || secret !== process.env.ADMIN_PASSWORD) {
      return json(401, { ok:false, error: 'unauthorized' });
    }
    const url = new URL(event.rawUrl || ('https://x/?'+(event.rawQuery || '')));
    const week = Number(url.searchParams.get('week') || 0);
    if (!week) return json(400, { ok:false, error:'week required' });

    const data = await getAssignments(week);
    if(!data) return json(404, { ok:false, error:'No assignments for this week' });

    return json(200, { ok:true, week: data.week, pairs: data.pairs || [], createdAt: data.createdAt || null });
  }catch(e){
    console.error('[admin-targets] error', e);
    return json(500, { ok:false, error: e.message });
  }
};

function json(status, body){
  return { statusCode: status, headers: { 'content-type':'application/json' }, body: JSON.stringify(body, null, 2) };
}
