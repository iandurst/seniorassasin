const { ok } = require('./util');
const { getParticipants, getSettings } = require('./db');

exports.handler = async () => {
  const participants = await getParticipants();
  const settings = await getSettings();
  const leaderboard = [...participants].sort((a,b)=> (b.eliminations||0) - (a.eliminations||0));
  const prizePool = settings.prizePoolOverride != null
    ? settings.prizePoolOverride
    : (Number(settings.entryFee||0) * participants.length);
  return ok({ participants, leaderboard, prizePool, settings });
};
