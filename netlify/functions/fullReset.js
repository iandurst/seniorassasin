const { base, setSetting } = require('../../api/_airtable');

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
    const votes = await base('Votes').select({}).all();
    if(votes.length) await base('Votes').destroy(votes.map(r=>r.id));
    const elim = await base('Eliminations').select({}).all();
    if(elim.length) await base('Eliminations').destroy(elim.map(r=>r.id));
    const parts = await base('Participants').select({}).all();
    for(const p of parts){
      await base('Participants').update(p.id, { Verified:false, Status:'Pending', Eliminations:0, Alive:true, WeekEliminated: null });
    }
    await setSetting('basePrize', '0');
    await setSetting('weekNumber', '1');
    return { statusCode: 200, headers: {'content-type':'application/json'}, body: JSON.stringify({ ok:true }) };
  } catch(e) {
    return { statusCode: 500, body: 'Error: ' + e.message };
  }
};
