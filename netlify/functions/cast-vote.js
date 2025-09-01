const { ok, bad, notAllowed, parse } = require('./util');
const { getCurrentVote, saveCurrentVote, getSettings, saveSettings } = require('./db');

exports.handler = async (event) => {
  if(event.httpMethod !== 'POST') return notAllowed();
  const body = parse(event);
  const { token, choice } = body;
  if(!token || !['stop','continue'].includes(choice)) return bad('Missing token or invalid choice.');

  const v = await getCurrentVote();
  if(!v) return bad('No active vote.', 400);

  const now = Date.now();
  const start = Date.parse(v.startAt);
  const end = Date.parse(v.endAt);
  if(v.status !== 'open') return bad('Voting closed.', 400);
  if(now < start) return bad('Voting has not started.', 400);
  if(now > end) return bad('Voting window ended.', 400);

  const pid = v.tokenMap[token];
  if(!pid) return bad('Invalid token.', 400);
  if(v.votes[pid]) return bad('You have already voted.', 400);

  v.votes[pid] = choice;
  if(choice === 'stop') v.counts.stop += 1;
  else v.counts.continue += 1;

  if(v.counts.stop >= v.threshold){
    v.status = 'closed';
    v.closedAt = new Date().toISOString();
    v.result = { stopped: true };
    const s = await getSettings();
    s.gameOver = true;
    await saveSettings(s);
  }

  await saveCurrentVote(v);
  return ok({ recorded: true, counts: v.counts, threshold: v.threshold, status: v.status });
};
