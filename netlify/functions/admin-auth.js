
exports.handler = async (event) => {
  const secret = event.headers['x-admin-secret'] || event.headers['X-Admin-Secret'];
  if (!process.env.ADMIN_PASSWORD) {
    return { statusCode: 500, body: JSON.stringify({ ok:false, error: 'ADMIN_PASSWORD not set' }) };
  }
  if (secret !== process.env.ADMIN_PASSWORD) {
    return { statusCode: 401, body: JSON.stringify({ ok:false, error: 'unauthorized' }) };
  }
  return { statusCode: 200, body: JSON.stringify({ ok:true }) };
};
