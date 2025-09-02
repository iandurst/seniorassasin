
// /.netlify/functions/signup
const { getParticipants, saveParticipants } = require('./db');
const { sendSms, toE164 } = require('./sms');

exports.handler = async (event) => {
  try{
    if (event.httpMethod !== 'POST') return json(405, { ok:false, error:'Method Not Allowed' });
    const input = JSON.parse(event.body || '{}');
    const name  = (input.name || '').trim();
    const phone = (input.phone || '').trim();

    if(!phone) return json(400, { ok:false, error: 'phone required' });

    const to = toE164(phone, process.env.DEFAULT_COUNTRY_CODE || '+1');
    const list = await getParticipants();
    if (!list.find(p => p.phone === to)) {
      list.push({ phone: to, name, ts: Date.now() });
      await saveParticipants(list);
    }

    // Send welcome SMS (await so Netlify doesn't exit early)
    const welcome = `Thanks for signing up${name ? ', ' + name : ''}! You'll receive Senior Assassin updates here. Reply STOP to opt out.`;
    let sentId = null;
    try{
      const res = await sendSms(to, welcome);
      sentId = res?.raw?.data?.id || null;
    }catch(e){
      // Don't fail signup if SMS fails; but surface the reason
      console.error('[signup] SMS failed', e.message, e.data || '');
      return json(200, { ok:true, sms:false, reason: e.message, telnyx: e.data || null });
    }

    return json(200, { ok:true, sms:true, id: sentId });
  }catch(e){
    console.error('[signup] error', e);
    return json(500, { ok:false, error: e.message });
  }
};

function json(status, body){
  return { statusCode: status, headers: { 'content-type':'application/json' }, body: JSON.stringify(body) };
}
