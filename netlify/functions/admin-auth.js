
// /.netlify/functions/admin-auth
exports.handler = async (event) => {
  try{
    const secret = event.headers['x-admin-secret'] || event.headers['X-Admin-Secret'];
    if (!process.env.ADMIN_PASSWORD) {
      return json(500, { ok:false, error: 'ADMIN_PASSWORD not set' });
    }
    if (secret !== process.env.ADMIN_PASSWORD) {
      return json(401, { ok:false, error: 'unauthorized' });
    }
    return json(200, { ok:true });
  }catch(e){
    return json(500, { ok:false, error: e.message });
  }
};
function json(status, body){
  return { statusCode: status, headers: { 'content-type':'application/json' }, body: JSON.stringify(body) };
}
