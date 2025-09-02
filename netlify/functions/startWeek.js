const { setSetting, getSettings, nowChicago, base } = require('../../api/_airtable');

function isAdmin(event){
  const expected = process.env.ADMIN_PASSWORD || 'Slapshot2007';
  const headers = event.headers || {};
  // Netlify lower-cases headers; be defensive anyway
  const got = headers['x-admin-password'] || headers['X-Admin-Password'] || headers['X-ADMIN-PASSWORD'];
  return !!got && got === expected;
}
function unauthorized(){
  return { statusCode: 401, body: 'Unauthorized' };
}

exports.handler = async (event) => {
  if(!isAdmin(event)) return unauthorized();
  if(event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  try {
    const settings = await getSettings().catch(()=>({}));
    const current = parseInt(settings.weekNumber || '0', 10);
    const next = (isNaN(current) ? 0 : current) + 1;
    await setSetting('weekNumber', String(next));
    await setSetting('weekStartISO', nowChicago().toISO());
    // clear votes for new week
    const votes = await base('Votes').select({}).all();
    if(votes.length) await base('Votes').destroy(votes.map(r=>r.id));
    return { statusCode: 200, headers: {'content-type':'application/json'}, body: JSON.stringify({ ok:true, weekNumber: next }) };
  } catch(e) {
    return { statusCode: 500, body: 'Error: ' + e.message };
  }
};
