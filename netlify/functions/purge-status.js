
const { getPurge } = require('./db');
exports.handler = async () => {
  try{
    const now = Date.now();
    const state = await getPurge();
    const endsAtMs = state?.endsAt ? Date.parse(state.endsAt) : 0;
    const startedAtMs = state?.startedAt ? Date.parse(state.startedAt) : 0;
    const active = !!(endsAtMs && now < endsAtMs && startedAtMs && state.active !== false);
    const remainingMs = active ? (endsAtMs - now) : 0;
    return { statusCode: 200, headers: {'content-type':'application/json'}, body: JSON.stringify({ ok:true, active, startedAt: state?.startedAt || null, endsAt: state?.endsAt || null, remainingMs }) };
  }catch(e){
    return { statusCode: 500, body: JSON.stringify({ ok:false, error: e.message }) };
  }
};
