const { ok } = require('./util');
const { getCurrentVote, saveCurrentVote } = require('./db');

exports.handler = async () => {
  const v = await getCurrentVote();
  if(!v) return ok({ status: 'none' });
  const now = Date.now();
  const start = Date.parse(v.startAt);
  const end = Date.parse(v.endAt);
  if(v.status === 'open' && now > end){
    v.status = 'closed';
    v.closedAt = new Date().toISOString();
    v.result = { stopped: v.counts.stop >= v.threshold };
    await saveCurrentVote(v);
  }
  return ok({
    status: v.status,
    startAt: v.startAt,
    endAt: v.endAt,
    counts: v.counts,
    threshold: v.threshold,
    result: v.result || null
  });
};
