const { ok, bad, notAllowed, parse, requireAdmin } = require('./util');
const { getParticipants, saveParticipants } = require('./db');

exports.handler = async (event) => {
  if(event.httpMethod !== 'POST') return notAllowed();
  try{ requireAdmin(event, process.env); }catch{ return bad('Unauthorized', 401); }
  const { killerId, targetId } = parse(event);
  if(!killerId || !targetId || killerId === targetId) return bad('Invalid killer/target ids.');

  const list = await getParticipants();
  const killer = list.find(p => p.id === killerId && p.status === 'active');
  const target = list.find(p => p.id === targetId && p.status === 'active');
  if(!killer || !target) return bad('Not found or not active.');
  if(!killer.alive) return bad('Eliminator must be alive.');
  if(!target.alive) return bad('Target is already out.');

  target.alive = false;
  target.eliminatedBy = killer.id;
  killer.eliminations = (killer.eliminations||0) + 1;

  await saveParticipants(list);
  return ok({ killer, target });
};
