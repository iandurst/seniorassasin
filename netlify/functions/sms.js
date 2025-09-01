// sms.js: SMS sender for Netlify Functions using Telnyx by default
// Providers supported:
//   - telnyx (default)
//   - textbelt (legacy)
//   - clicksend (legacy)
//
// ENV for Telnyx:
//   TELNYX_API_KEY                (required)
//   TELNYX_MESSAGING_PROFILE_ID   (recommended)
//   TELNYX_FROM                   (optional — E.164 number or approved alphanumeric ID)
//   SMS_PROVIDER=telnyx           (optional)

const DEFAULT_PROVIDER = (process.env.SMS_PROVIDER || 'telnyx').toLowerCase();

async function sendSms_telnyx(to, body){
  const apiKey = process.env.TELNYX_API_KEY;
  if(!apiKey){
    const err = new Error('Missing TELNYX_API_KEY');
    err.code = 'CONFIG';
    throw err;
  }
  const payload = { to, text: body };
  const mp = process.env.TELNYX_MESSAGING_PROFILE_ID;
  const from = process.env.TELNYX_FROM;
  if(mp) payload.messaging_profile_id = mp;
  if(from) payload.from = from;

  const res = await fetch('https://api.telnyx.com/v2/messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  const data = await res.json().catch(()=> ({}));
  if(!res.ok){
    const err = new Error(`Telnyx error ${res.status}`);
    err.data = data;
    throw err;
  }
  return { provider: 'telnyx', raw: data };
}

// ===== Legacy providers (optional) =====
async function sendSms_textbelt(to, body){
  const key = process.env.TEXTBELT_API_KEY || 'textbelt';
  const sender = process.env.TEXTBELT_SENDER_NAME || 'Notifier';
  const res = await fetch('https://textbelt.com/text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: to, message: body, key, sender })
  });
  const data = await res.json();
  if(!data.success){
    const err = new Error('Textbelt failed');
    err.data = data;
    throw err;
  }
  return { provider: 'textbelt', raw: data };
}

async function sendSms_clicksend(to, body){
  const user = process.env.CLICKSEND_USERNAME;
  const key = process.env.CLICKSEND_API_KEY;
  if(!user || !key) throw new Error('Missing ClickSend creds');
  const res = await fetch('https://rest.clicksend.com/v3/sms/send', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${user}:${key}`).toString('base64'),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ messages: [{ to, body }] })
  });
  const data = await res.json();
  if(res.status < 200 || res.status >= 300){
    const err = new Error('ClickSend failed');
    err.data = data;
    throw err;
  }
  return { provider: 'clicksend', raw: data };
}

async function sendSms(to, body){
  const provider = (process.env.SMS_PROVIDER || DEFAULT_PROVIDER).toLowerCase();
  if(provider === 'clicksend') return await sendSms_clicksend(to, body);
  if(provider === 'textbelt') return await sendSms_textbelt(to, body);
  // default to Telnyx
  return await sendSms_telnyx(to, body);
}

module.exports = { sendSms };
