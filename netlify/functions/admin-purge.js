
// /.netlify/functions/admin-purge — sets purge state; SMS disabled
const { savePurge } = require('./db');

exports.handler = async (event) => {
  try{
    if (event.httpMethod !== 'POST') return json(405, { ok:false, error:'Method Not Allowed' });
    const secret = event.headers['x-admin-secret'] || event.headers['X-Admin-Secret'];
    if (!process.env.ADMIN_PASSWORD || secret !== process.env.ADMIN_PASSWORD) {
      return json(401, { ok:false, error: 'unauthorized' });
    }
    const input = JSON.parse(event.body || '{}');
    const action = (input.action || 'start').toLowerCase();
    const now = Date.now();
    const duration = Number(process.env.PURGE_DURATION_MS || (3*60*60*1000));

    if (action === 'end') {
      const purge = { active:false, endedAt: new Date(now).toISOString() };
      await savePurge(purge);
      return json(200, { ok:true, purge, sms:false, note:'SMS disabled — notify manually if needed.' });
    }

    const endsAt = now + duration;
    const purge = { active:true, startedAt:new Date(now).toISOString(), endsAt:new Date(endsAt).toISOString(), durationMs: duration };
    await savePurge(purge);

    return json(200, { ok:true, purge, sms:false, note:'Purge set. SMS disabled — notify manually.' });
  }catch(e){
    console.error('[admin-purge] error', e);
    return json(500, { ok:false, error: e.message });
  }
};

function json(status, body){
  return { statusCode: status, headers: { 'content-type':'application/json' }, body: JSON.stringify(body,null,2) };
}
