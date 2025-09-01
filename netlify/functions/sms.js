// sms.js: provider-agnostic SMS sender for Netlify Functions
// Supported providers:
//   - textbelt (default): uses https://textbelt.com/text
//       Env: TEXTBELT_API_KEY (optional; use 'textbelt' for 1 free SMS/day for testing)
//       Optional: TEXTBELT_SENDER_NAME
//   - clicksend: uses https://rest.clicksend.com/v3/sms/send
//       Env: CLICKSEND_USERNAME, CLICKSEND_API_KEY
//
const DEFAULT_PROVIDER = process.env.SMS_PROVIDER || 'textbelt';

async function sendSms_textbelt(to, body){
  const key = process.env.TEXTBELT_API_KEY || 'textbelt';
  const sender = process.env.TEXTBELT_SENDER_NAME || 'PCS Senior Assasin';
  const res = await fetch('https://textbelt.com/text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: to, message: body, key, sender })
  });
  let data = {};
  try{ data = await res.json(); }catch{}
  if(!data.success){
    const err = new Error(data.error || 'Textbelt send failed');
    err.data = data;
    throw err;
  }
  return { id: data.textId, provider: 'textbelt', raw: data };
}

function basicAuth(u,p){
  return 'Basic ' + Buffer.from(`${u}:${p}`).toString('base64');
}

async function sendSms_clicksend(to, body){
  const username = process.env.CLICKSEND_USERNAME;
  const apiKey = process.env.CLICKSEND_API_KEY;
  if(!username || !apiKey) throw new Error('ClickSend credentials missing.');
  const payload = { messages: [{ to, body, source: 'pcs-senior-assassin' }] };
  const res = await fetch('https://rest.clicksend.com/v3/sms/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': basicAuth(username, apiKey)
    },
    body: JSON.stringify(payload)
  });
  let data = {};
  try{ data = await res.json(); }catch{}
  if(!res.ok){
    const err = new Error(data.response_msg || 'ClickSend send failed');
    err.data = data;
    throw err;
  }
  return { provider: 'clicksend', raw: data };
}

async function sendSms(to, body){
  const provider = (process.env.SMS_PROVIDER || DEFAULT_PROVIDER).toLowerCase();
  if(provider === 'clicksend') return await sendSms_clicksend(to, body);
  // default
  return await sendSms_textbelt(to, body);
}

module.exports = { sendSms };
