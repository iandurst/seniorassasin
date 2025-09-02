
// /.netlify/functions/telnyx-selftest
const { sendSms, toE164 } = require('./sms');

exports.handler = async (event) => {
  try{
    const q = new URLSearchParams(event.rawQuery || '');
    const to = toE164(q.get('to') || '');
    if(!to) return json(400, { ok:false, error:'provide ?to=+1...' });
    const r = await sendSms(to, 'Test from Netlify/Telnyx ✅');
    return json(200, { ok:true, id: r?.raw?.data?.id || null });
  }catch(e){
    return json(500, { ok:false, error:e.message, details: e.data || null });
  }
};

function json(status, body){
  return { statusCode: status, headers: { 'content-type':'application/json' }, body: JSON.stringify(body, null, 2) };
}
