
const { ok, initBlobs } = require('./util'); const { getSettings, getVoteState, saveVoteState } = require('./db');
exports.handler = async (event) => {
  initBlobs(event);
  const settings = await getSettings(); if(settings.gameOver || (settings.week||0)===0) return ok({ skipped:true, reason:'not active' });
  const now = new Date(); const central = new Date(now.toLocaleString('en-US',{timeZone:'America/Chicago'}));
  if(central.getDay()!==5 || central.getHours()!==15) return ok({ skipped:true, reason:'not Friday 3pm CT' });
  let state = await getVoteState() || { open:false, votes:{}, week: settings.week||0 }; if(state.open) return ok({ alreadyOpen:true });
  const openedAt = central; const closesAt = new Date(openedAt.getTime()+3*3600*1000);
  state = { open:true, openedAt:openedAt.toISOString(), closesAt:closesAt.toISOString(), votes:{}, week: settings.week||0 }; await saveVoteState(state); return ok(state);
};
