const { prizePool } = require('../../api/_airtable');

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

exports.handler = async () => {
  try {
    const p = await prizePool();
    return { statusCode: 200, headers: {'content-type':'application/json'}, body: JSON.stringify(p) };
  } catch(e) {
    return { statusCode: 500, body: 'Error: ' + e.message };
  }
};
