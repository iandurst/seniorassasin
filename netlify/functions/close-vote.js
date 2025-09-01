const { ok } = require('./util');
const { getSettings, saveSettings, getParticipants, getVoteState, saveVoteState } = require('./db');

exports.handler = async () => {
  const settings = await getSettings();
  if(settings.gameOver) return ok({ skipped:true, reason:'game over' });

  const now = new Date();
  const central = new Date(now.toLocaleString('en-US', { timeZone: 'America/Chicago' }));
  const isFriday = central.getDay() === 5;
  const hour = central.getHours();
  if(!isFriday || hour !== 18){ // 6 PM
    return ok({ skipped:true, reason:'not Friday 6pm CT' });
  }

  let state = await getVoteState();
  if(!state || !state.open) return ok({ skipped:true, reason:'no open vote' });

  // Close
  state.open = false;
  state.closedAt = new Date().toISOString();

  // Tally
  const participants = await getParticipants();
  const eligible = participants.filter(p => p.status === 'active' && p.alive);
  const total = eligible.length || 1;
  let stop=0, cont=0;
  for(const id of Object.keys(state.votes||{})){
    const v = state.votes[id];
    if(v === 'stop') stop++;
    if(v === 'continue') cont++;
  }
  const stopPct = stop / total;
  const outcome = stopPct >= 0.75 ? 'stop' : 'continue';
  if(outcome === 'stop'){
    settings.gameOver = true;
    settings.endedAt = new Date().toISOString();
    await saveSettings(settings);
  }
  state.result = { stop, cont, totalEligible: total, stopPct, outcome };
  await saveVoteState(state);
  return ok(state);
};
