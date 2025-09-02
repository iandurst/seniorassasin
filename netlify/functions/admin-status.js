
const { getStatus, saveStatus } = require('./db');
exports.handler = async (event) => {
  try{
    const secret = event.headers['x-admin-secret'] || event.headers['X-Admin-Secret'];
    if (!process.env.ADMIN_PASSWORD || secret !== process.env.ADMIN_PASSWORD) return j(401, { ok:false, error:'unauthorized' });
    if (event.httpMethod === 'GET') {
      const url = new URL(event.rawUrl || ('https://x/?'+(event.rawQuery || '')));
      const week = Number(url.searchParams.get('week') || 0);
      if (!week) return j(400, { ok:false, error:'week required' });
      const data = await getStatus(week);
      return j(200, { ok:true, week, status: data || {} });
    }
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const week = Number(body.week || 0);
      const phone = String(body.phone || '').trim();
      const status = String(body.status || 'Active');
      if (!week || !phone) return j(400, { ok:false, error:'week and phone required' });
      const data = await getStatus(week) || {};
      data[phone] = status;
      await saveStatus(week, data);
      return j(200, { ok:true, week, phone, status });
    }
    return j(405, { ok:false, error:'Method Not Allowed' });
  }catch(e){
    return j(500, { ok:false, error: e.message });
  }
};
const j = (s,b)=>({ statusCode:s, headers:{'content-type':'application/json'}, body: JSON.stringify(b, null, 2) });
