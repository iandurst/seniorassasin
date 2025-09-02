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
    const body = JSON.parse(event.body || '{}');
    const id = body.participantId;
    const action = body.action || 'verify';
    if(!id) return { statusCode: 400, body: 'Missing participantId' };
    if(action==='verify') {
      await base('Participants').update(id, { Verified:true, Status:'Active' });
    } else if(action==='unverify') {
      await base('Participants').update(id, { Verified:false, Status:'Pending' });
    } else {
      return { statusCode: 400, body: 'Unknown action' };
    }
    return { statusCode: 200, headers: {'content-type':'application/json'}, body: JSON.stringify({ ok:true }) };
  } catch(e) {
    return { statusCode: 500, body: 'Error: ' + e.message };
  }
};
