
const { savePurge } = require('./db');
exports.handler = async (event) => {
  try{
    if (event.httpMethod !== 'POST') return j(405, { ok:false, error:'Method Not Allowed' });
    const secret = event.headers['x-admin-secret'] || event.headers['X-Admin-Secret'];
    if (!process.env.ADMIN_PASSWORD || secret !== process.env.ADMIN_PASSWORD) return j(401, { ok:false, error:'unauthorized' });
    const input = JSON.parse(event.body || '{}');
    const action = (input.action || 'start').toLowerCase();
    const now = Date.now();
    const duration = Number(process.env.PURGE_DURATION_MS || (3*60*60*1000));
    if (action === 'end') {
      const purge = { active:false, endedAt: new Date(now).toISOString() };
      await savePurge(purge);
      return j(200, { ok:true, purge, note:'SMS disabled — notify manually if needed.' });
    }
    const endsAt = now + duration;
    const purge = { active:true, startedAt:new Date(now).toISOString(), endsAt:new Date(endsAt).toISOString(), durationMs: duration };
    await savePurge(purge);
    return j(200, { ok:true, purge, note:'Purge set. SMS disabled — notify manually.' });
  }catch(e){
    return j(500, { ok:false, error: e.message });
  }
};
const j = (s,b)=>({ statusCode:s, headers:{'content-type':'application/json'}, body: JSON.stringify(b, null, 2) });
