
// /.netlify/functions/signup — saves participant; no automated SMS
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
    if (event.httpMethod !== 'POST') return json(405, { ok:false, error:'Method Not Allowed' });
    const input = JSON.parse(event.body || '{}');
    const name  = (input.name || '').trim();
    const phone = toE164((input.phone || '').trim());

    if(!phone) return json(400, { ok:false, error: 'phone required' });

    const list = await getParticipants();
    if (!list.find(p => p.phone === phone)) {
      list.push({ phone, name, ts: Date.now() });
      await saveParticipants(list);
    }

    return json(200, { ok:true, sms:false, note:'Automated SMS is disabled. Admin will text targets manually.' });
  }catch(e){
    console.error('[signup] error', e);
    return json(500, { ok:false, error: e.message });
  }
};

function json(status, body){
  return { statusCode: status, headers: { 'content-type':'application/json' }, body: JSON.stringify(body) };
}
