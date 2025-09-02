const { ok, bad, notAllowed, parse, id, cleanPhone } = require('./util');
const { getParticipants, saveParticipants } = require('./db');

exports.handler = async (event) => {
  if(event.httpMethod !== 'POST') return notAllowed();
  const body = parse(event);
  const firstName = String(body.firstName||'').trim();
  const lastName = String(body.lastName||'').trim();
  const phone = cleanPhone(body.phone);
  if(!firstName || !lastName || !phone) return bad('Please provide first name, last name, and a valid phone number.');

  const participants = await getParticipants();
  if(participants.some(p => p.phone === phone)){
    return bad('That phone number is already registered.');
  }
  const rec = {
    id: id(),
    firstName, lastName, phone,
    status: 'pending',
    alive: false,
    eliminations: 0,
    eliminatedBy: null,
    joinedAt: new Date().toISOString()
  };
  participants.push(rec);
  await saveParticipants(participants);
  // Send welcome SMS (optional)
  try{
    const { sendSms } = require('./sms');
    await sendSms(rec.phone, "Thanks for signing up! You'll receive updates here. Reply STOP to opt out.");
  }catch(e){
    console.error('[signup] SMS failed (non-fatal)', e.message || e);
  }

  return ok(rec);
};
