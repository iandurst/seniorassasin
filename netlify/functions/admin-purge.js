
// netlify/functions/admin-purge.js
const { getParticipants, savePurge } = require('./db');
const { sendBulkSms } = require('./sms');

exports.handler = async (event) => {
  try{
    if (event.httpMethod && event.httpMethod !== 'POST') {
      return resp(405, { ok:false, error: 'Method Not Allowed' });
    }
    const adminToken = event.headers['x-admin-token'] || event.headers['X-Admin-Token'] || event.queryStringParameters?.token;
    if (!process.env.ADMIN_TOKEN || adminToken !== process.env.ADMIN_TOKEN) {
      return resp(401, { ok:false, error: 'Unauthorized' });
    }

    const now = Date.now();
    const body = JSON.parse(event.body || '{}');
    const action = (body.action || 'start').toLowerCase();
    const durationMs = Number(process.env.PURGE_DURATION_MS || (3 * 60 * 60 * 1000)); // default 3 hours

    if (action === 'end') {
      const purge = { active: false, endedAt: new Date(now).toISOString() };
      await savePurge(purge);
      return resp(200, { ok:true, purge });
    }

    // default: start
    const endsAt = now + durationMs;
    const purge = { active: true, startedAt: new Date(now).toISOString(), endsAt: new Date(endsAt).toISOString(), durationMs };
    await savePurge(purge);

    // notify all participants
    const people = await getParticipants();
    const numbers = people.map(p => p.phone).filter(Boolean);
    const until = new Date(endsAt).toLocaleString('en-US', { hour: 'numeric', minute: '2-digit' });
    const msg = `⚠️ PURGE STARTED: The 3-hour purge is live now and ends at ${until}. Immunity items still apply (goggles over eyes; 2 pool floaties visible on each arm). Reply STOP to opt out.`;

    let results = [];
    if (numbers.length > 0) {
      results = await sendBulkSms(numbers, msg, { concurrency: 5 });
    }

    return resp(200, { ok:true, purge, notified: results.length, results });
  }catch(e){
    console.error('[admin-purge] failed', e.message, e.data || '', e.stack);
    return resp(500, { ok:false, error: e.message, details: e.data || null });
  }
};

function resp(status, body){
  return { statusCode: status, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body, null, 2) };
}
