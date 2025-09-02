
const { ok, bad, notAllowed, requireAdmin } = require('./util');
const { deleteByPrefix, saveSettings, clearPurge, saveParticipants } = require('./db');

exports.handler = async (event) => {
  if(event.httpMethod !== 'POST') return notAllowed();
  try{
    requireAdmin(event, process.env);
  }catch{
    return bad('Unauthorized', 401);
  }
  try{
    // Reset participants
    await saveParticipants([]);
    // Reset settings
    const defaultSettings = { entryFee: 5, prizePoolOverride: null, week: 0, lastStart: null, gameEnded: false };
    await saveSettings(defaultSettings);
    // Clear purge and delete assignments/votes
    await clearPurge();
    const delAssign = await deleteByPrefix('assignments-week-');
    const delVotes = await deleteByPrefix('votes-');

    return ok({ ok:true, message: 'All core data reset.', deleted: { assignments: delAssign, votes: delVotes } });
  }catch(e){
    console.error('[admin-reset] failed', e);
    return bad(e.message || 'Reset failed', 500);
  }
};
