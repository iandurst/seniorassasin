const { ok } = require('./util');
const { getParticipants, getSettings } = require('./db');

exports.handler = async () => {
  const participants = await getParticipants();
  const settings = await getSettings();
  const active = participants.filter(p => p.status === 'active');
  const leaderboard = [...active].sort((a,b)=> (b.eliminations||0) - (a.eliminations||0));
  const prizePool = settings.prizePoolOverride != null
    ? settings.prizePoolOverride
    : (Number(settings.entryFee||0) * active.length);
  return ok({ participants, leaderboard, prizePool, settings });
};
