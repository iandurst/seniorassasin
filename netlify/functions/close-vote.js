const { ok, bad, notAllowed, requireAdmin } = require('./util');
const { getCurrentVote, saveCurrentVote, getSettings, saveSettings } = require('./db');

exports.handler = async (event) => {
  if(event.httpMethod !== 'POST') return notAllowed();
  try{ requireAdmin(event, process.env); }catch{ return bad('Unauthorized', 401); }

  const v = await getCurrentVote();
  if(!v) return bad('No current vote.');
  if(v.status !== 'open') return ok({ alreadyClosed: true, result: v.result || null });

  v.status = 'closed';
  v.closedAt = new Date().toISOString();
  v.result = { stopped: v.counts.stop >= v.threshold };
  await saveCurrentVote(v);

  if(v.result.stopped){
    const s = await getSettings();
    s.gameOver = true;
    await saveSettings(s);
  }

  return ok({ closed: true, result: v.result, counts: v.counts, threshold: v.threshold });
};
