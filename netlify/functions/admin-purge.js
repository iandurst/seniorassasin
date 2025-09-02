
const { ok, bad, notAllowed, requireAdmin } = require('./util');
const { getParticipants, savePurge } = require('./db');
const { sendBulkSms } = require('./sms');

exports.handler = async (event) => {
  if(event.httpMethod !== 'POST') return notAllowed();
  try{
    requireAdmin(event, process.env);
  }catch{
    return bad('Unauthorized', 401);
  }
  try{
    const now = Date.now();
    const body = (()=> { try{ return JSON.parse(event.body || '{}') }catch{ return {} } })();
    const action = (body.action || 'start').toLowerCase();
    const durationMs = Number(process.env.PURGE_DURATION_MS || (3 * 60 * 60 * 1000));

    if(action === 'end'){
      const purge = { active: false, endedAt: new Date(now).toISOString() };
      await savePurge(purge);
      return ok({ ok:true, purge });
    }

    const endsAt = now + durationMs;
    const purge = { active: true, startedAt: new Date(now).toISOString(), endsAt: new Date(endsAt).toISOString(), durationMs };
    await savePurge(purge);

    // Notify active participants
    const participants = await getParticipants();
    const numbers = participants.filter(p => p.status === 'active').map(p => p.phone).filter(Boolean);
    const until = new Date(endsAt).toLocaleString('en-US', { hour: 'numeric', minute: '2-digit' });
    const msg = `⚠️ PURGE STARTED: The 3-hour purge is live now and ends at ${until}. Immunity items still apply (goggles over eyes; 2 pool floaties visible on each arm). Reply STOP to opt out.`;

    let results = [];
    if(numbers.length){
      results = await sendBulkSms(numbers, msg, { concurrency: 5 });
    }

    return ok({ ok:true, purge, notified: results.length, results });
  }catch(e){
    console.error('[admin-purge] failed', e);
    return bad(e.message || 'Purge failed', 500);
  }
};
