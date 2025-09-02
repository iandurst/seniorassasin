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
  if(event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  try {
    const body = JSON.parse(event.body || '{}');
    const first = (body.firstName||'').trim();
    const last = (body.lastName||'').trim();
    const phone = (body.phone||'').trim();
    if(!first || !last || !/^\d{10}$/.test(phone)) {
      return { statusCode: 400, body: 'Invalid input' };
    }
    await base('Participants').create({
      FirstName:first, LastName:last, Phone:phone,
      Verified:false, Status:'Pending', Eliminations:0, Alive:true
    });
    return { statusCode: 200, headers: {'content-type':'application/json'}, body: JSON.stringify({ ok:true }) };
  } catch(e) {
    return { statusCode: 500, body: 'Error: ' + e.message };
  }
};
