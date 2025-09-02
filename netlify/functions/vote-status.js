const { ok, bad, notAllowed, isVotingOpen } = require('./util');
const { getParticipants, getSettings, getVotes } = require('./db');
const { votingKey } = require('./util');

exports.handler = async (event) => {
  if(event.httpMethod !== 'GET') return notAllowed();

  const settings = await getSettings();
  const participants = await getParticipants();
  const activeAlive = participants.filter(p => p.status === 'active' && p.alive);
  const open = !settings.gameEnded && settings.week > 0 && isVotingOpen(new Date());
  const key = votingKey(new Date());
  const votes = await getVotes(key);
  const threshold = Math.ceil(0.75 * activeAlive.length);

  return ok({
    open,
    gameEnded: settings.gameEnded,
    week: settings.week,
    totalEligible: activeAlive.length,
    windowKey: key,
    counts: votes.counts,
    threshold
  });
};
