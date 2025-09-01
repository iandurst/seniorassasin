
const { ok, bad, notAllowed, parse, requireAdmin, initBlobs } = require('./util');
const { getSettings, saveSettings } = require('./db');

exports.handler = async (event) => {
  initBlobs(event);
  if(event.httpMethod !== 'POST') return notAllowed();
  try{ requireAdmin(event) }catch{ return bad('Unauthorized', 401) }
  const body = parse(event);
  const s = await getSettings();
  if(typeof body.entryFee === 'number' && body.entryFee >= 0) s.entryFee = Math.round(body.entryFee);
  if(body.prizePoolOverride === null || typeof body.prizePoolOverride === 'number') s.prizePoolOverride = body.prizePoolOverride;
  await saveSettings(s);
  return ok(s);
};
