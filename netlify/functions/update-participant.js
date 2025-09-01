const { ok, bad, notAllowed, parse, requireAdmin } = require('./util');
const { getParticipants, saveParticipants } = require('./db');

exports.handler = async (event) => {
  if(event.httpMethod !== 'POST') return notAllowed();
  try{ requireAdmin(event, process.env); }catch{ return bad('Unauthorized', 401); }
  const body = parse(event);
  const { id, alive } = body;
  if(!id || typeof alive !== 'boolean') return bad('Missing id or alive boolean.');
  const list = await getParticipants();
  const idx = list.findIndex(p => p.id === id);
  if(idx === -1) return bad('Participant not found.', 404);
  list[idx].alive = alive;
  if(alive === true) list[idx].eliminatedBy = null;
  await saveParticipants(list);
  return ok(list[idx]);
};
