const { base } = require('../../api/_airtable');

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
    const elim = await base('Eliminations').select({}).all();
    if(elim.length) await base('Eliminations').destroy(elim.map(r=>r.id));
    const votes = await base('Votes').select({}).all();
    if(votes.length) await base('Votes').destroy(votes.map(r=>r.id));
    return { statusCode: 200, headers: {'content-type':'application/json'}, body: JSON.stringify({ ok:true }) };
  } catch(e) {
    return { statusCode: 500, body: 'Error: ' + e.message };
  }
};
