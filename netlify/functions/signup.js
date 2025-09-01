
const { ok, bad, notAllowed, parse, id, cleanPhone, initBlobs } = require('./util');
const { getParticipants, saveParticipants } = require('./db');

exports.handler = async (event) => {
  initBlobs(event);
  if(event.httpMethod !== 'POST') return notAllowed();
  const body = parse(event);
  const firstName = String(body.firstName||'').trim();
  const lastName = String(body.lastName||'').trim();
  const phone = cleanPhone(body.phone);
  if(!firstName || !lastName || !phone) return bad('Please provide first name, last name, and a valid phone number.');

  const participants = await getParticipants();
  if(participants.some(p => p.phone === phone)) return bad('That phone number is already registered.');

  participants.push({ id: id(), firstName, lastName, phone, status: 'pending', alive: false, eliminations: 0, eliminatedBy: null, joinedAt: new Date().toISOString() });
  await saveParticipants(participants);
  return ok({ ok:true });
};
