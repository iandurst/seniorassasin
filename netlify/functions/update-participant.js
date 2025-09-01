
const { ok, bad, notAllowed, parse, requireAdmin, cleanPhone, initBlobs } = require('./util');
const { getParticipants, saveParticipants } = require('./db');

exports.handler = async (event) => {
  initBlobs(event);
  if(event.httpMethod !== 'POST') return notAllowed();
  try{ requireAdmin(event) }catch{ return bad('Unauthorized', 401) }
  const body = parse(event);
  const { id } = body;
  if(!id) return bad('Missing id.');

  const list = await getParticipants();
  const idx = list.findIndex(p => p.id === id);
  if(idx === -1) return bad('Participant not found.', 404);
  const p = list[idx];

  if(typeof body.firstName === 'string') p.firstName = String(body.firstName).trim() || p.firstName;
  if(typeof body.lastName === 'string') p.lastName = String(body.lastName).trim() || p.lastName;
  if(typeof body.phone === 'string'){ const ph = cleanPhone(body.phone); if(!ph) return bad('Invalid phone.'); p.phone = ph; }
  if(typeof body.alive === 'boolean') p.alive = body.alive;
  if(typeof body.status === 'string'){ const allowed=['pending','active','rejected']; if(!allowed.includes(body.status)) return bad('Invalid status.'); p.status = body.status; if(body.status==='active'&&typeof body.alive!=='boolean') p.alive=true; if(body.status!=='active') p.alive=false; }

  list[idx] = p; await saveParticipants(list); return ok(p);
};
