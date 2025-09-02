
const { getParticipants, saveParticipants } = require('./db');
function toE164(input, defaultCC = (process.env.DEFAULT_COUNTRY_CODE || '+1')) {
  if (!input) return input;
  const s = String(input).trim();
  if (s.startsWith('+')) return s;
  const digits = s.replace(/\D/g, '');
  if (!digits) return input;
  if (digits.length === 10 && defaultCC === '+1') return defaultCC + digits;
  return s.startsWith('+') ? s : `+${digits}`;
}
exports.handler = async (event) => {
  try{
    if (event.httpMethod !== 'POST') return j(405, { ok:false, error: 'Method Not Allowed' });
    const input = JSON.parse(event.body || '{}');
    const name = (input.name || '').trim();
    const phone = toE164((input.phone || '').trim());
    if(!phone) return j(400, { ok:false, error: 'phone required' });
    const people = await getParticipants();
    if (!people.find(p => p.phone === phone)) {
      people.push({ name, phone, ts: Date.now() });
      await saveParticipants(people);
    }
    return j(200, { ok:true, sms:false, note:'Automated SMS disabled; admin will text targets manually.' });
  }catch(e){
    return j(500, { ok:false, error: e.message });
  }
};
const j = (s,b)=>({ statusCode:s, headers:{'content-type':'application/json'}, body: JSON.stringify(b) });
