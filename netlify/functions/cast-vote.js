const { ok, bad, notAllowed, parse, cleanPhone, isVotingOpen, votingKey } = require('./util');
const { getParticipants, getSettings, saveSettings, getVotes, saveVotes } = require('./db');

exports.handler = async (event) => {
  if(event.httpMethod !== 'POST') return notAllowed();
  const body = parse(event);
  const phone = cleanPhone(body.phone);
  const choice = (body.choice||'').toLowerCase();
  if(!phone || !['stop','continue'].includes(choice)) return bad('Provide a valid phone and choice.');

  const settings = await getSettings();
  if(settings.gameEnded) return bad('The game has already ended.');
  if(settings.week <= 0) return bad('Voting only starts after week 1.');
  if(!isVotingOpen(new Date())) return bad('Voting is closed right now.');

  const list = await getParticipants();
  const voter = list.find(p => p.status === 'active' && p.alive && p.phone === phone);
  if(!voter) return bad('No eligible player found with that phone (must be active & alive).');

  const key = votingKey(new Date());
  const votes = await getVotes(key);
  if(votes.votes[voter.id]){
    return ok({ alreadyVoted: true, counts: votes.counts, gameEnded: settings.gameEnded });
  }

  votes.votes[voter.id] = choice;
  votes.counts[choice] = (votes.counts[choice] || 0) + 1;
  await saveVotes(key, votes);

  // Evaluate threshold
  const eligibleCount = list.filter(p => p.status === 'active' && p.alive).length;
  const threshold = Math.ceil(0.75 * eligibleCount);
  if(votes.counts['stop'] >= threshold){
    settings.gameEnded = true;
    settings.gameEndedAt = new Date().toISOString();
    await saveSettings(settings);
    return ok({ recorded: true, counts: votes.counts, gameEnded: true, threshold });
  }

  return ok({ recorded: true, counts: votes.counts, gameEnded: false, threshold });
};
