const { ok, bad, notAllowed, requireAdmin } = require('./util');

exports.handler = async (event) => {
  if(event.httpMethod !== 'POST') return notAllowed();
  try{
    requireAdmin(event, process.env);
    return ok({ ok: true });
  }catch{
    return bad('Unauthorized', 401);
  }
};
