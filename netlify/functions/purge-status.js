
// /.netlify/functions/purge-status
const { getPurge } = require('./db');

exports.handler = async () => {
  try{
    const now = Date.now();
    const state = await getPurge();
    const endsAtMs = state?.endsAt ? Date.parse(state.endsAt) : 0;
    const startedAtMs = state?.startedAt ? Date.parse(state.startedAt) : 0;
    const active = !!(endsAtMs && now < endsAtMs && startedAtMs && state.active !== false);
    const remainingMs = active ? (endsAtMs - now) : 0;
    return json(200, { ok:true, active, startedAt: state?.startedAt || null, endsAt: state?.endsAt || null, remainingMs });
  }catch(e){
    return json(500, { ok:false, error: e.message });
  }
};

function json(status, body){
  return { statusCode: status, headers: { 'content-type':'application/json' }, body: JSON.stringify(body) };
}
