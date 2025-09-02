
const { ok, bad } = require('./util');
const { getPurge } = require('./db');

exports.handler = async () => {
  try{
    const now = Date.now();
    const state = await getPurge();
    const endsAtMs = state?.endsAt ? Date.parse(state.endsAt) : 0;
    const startedAtMs = state?.startedAt ? Date.parse(state.startedAt) : 0;
    const effectiveActive = !!(endsAtMs && now < endsAtMs && startedAtMs && state.active !== false);
    const remainingMs = effectiveActive ? (endsAtMs - now) : 0;
    return ok({
      ok: true,
      active: effectiveActive,
      startedAt: state?.startedAt || null,
      endsAt: state?.endsAt || null,
      remainingMs
    });
  }catch(e){
    return bad(e.message || 'Status failed', 500);
  }
};
