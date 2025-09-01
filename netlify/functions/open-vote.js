const { ok } = require('./util');
const { getSettings, getVoteState, saveVoteState } = require('./db');

exports.handler = async () => {
  const settings = await getSettings();
  if(settings.gameOver || (settings.week||0) === 0) return ok({ skipped:true, reason:'not active' });

  // Determine Central time hour
  const now = new Date();
  const central = new Date(now.toLocaleString('en-US', { timeZone: 'America/Chicago' }));
  const isFriday = central.getDay() === 5; // Fri
  const hour = central.getHours();
  if(!isFriday || hour !== 15){ // 3 PM
    return ok({ skipped:true, reason:'not Friday 3pm CT' });
  }

  let state = await getVoteState() || { open:false, votes:{}, week: settings.week||0 };
  if(state.open) return ok({ alreadyOpen:true });
  const openedAt = central;
  const closesAt = new Date(openedAt.getTime() + 3*3600*1000);
  state = { open:true, openedAt: openedAt.toISOString(), closesAt: closesAt.toISOString(), votes:{}, week: settings.week||0 };
  await saveVoteState(state);
  return ok(state);
};
