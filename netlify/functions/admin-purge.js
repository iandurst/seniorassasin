
// /.netlify/functions/admin-purge
const { getParticipants, savePurge } = require('./db');
const { sendSms } = require('./sms');

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
      return json(200, { ok:true, purge });
    }

    // Start purge
    const endsAt = now + duration;
    const purge = { active:true, startedAt:new Date(now).toISOString(), endsAt:new Date(endsAt).toISOString(), durationMs: duration };
    await savePurge(purge);

    // Notify all participants (await each to ensure logging)
    const people = await getParticipants();
    const numbers = people.map(p => p.phone).filter(Boolean);
    const until = new Date(endsAt).toLocaleString('en-US', { hour:'numeric', minute:'2-digit' });
    const text = `⚠️ PURGE STARTED: The 3-hour purge is live now and ends at ${until}. Immunity: goggles over eyes; 2 pool floaties visible on each arm.`;

    const results = [];
    for (const n of numbers) {
      try{
        const r = await sendSms(n, text);
        results.push({ to:n, ok:true, id:r?.raw?.data?.id || null });
      }catch(e){
        results.push({ to:n, ok:false, error:e.message, detail:e.data || null });
      }
    }

    return json(200, { ok:true, purge, notified: results.length, results });
  }catch(e){
    console.error('[admin-purge] error', e);
    return json(500, { ok:false, error: e.message });
  }
};

function json(status, body){
  return { statusCode: status, headers: { 'content-type':'application/json' }, body: JSON.stringify(body,null,2) };
}
