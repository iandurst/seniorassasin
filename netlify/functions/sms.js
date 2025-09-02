
// sms.js — Telnyx SMS helper
function toE164(input, defaultCC = (process.env.DEFAULT_COUNTRY_CODE || '+1')) {
  if (!input) return input;
  const s = String(input).trim();
  if (s.startsWith('+')) return s;
  const digits = s.replace(/\D/g, '');
  if (!digits) return input;
  if (digits.length === 10 && defaultCC === '+1') return defaultCC + digits;
  return s.startsWith('+') ? s : `+${digits}`;
}

async function sendSmsTelnyx(to, text) {
  const apiKey = process.env.TELNYX_API_KEY;
  const mp = process.env.TELNYX_MESSAGING_PROFILE_ID;
  const from = process.env.TELNYX_FROM;

  if (!apiKey) throw new Error('Missing TELNYX_API_KEY');
  if (!mp && !from) throw new Error('Set TELNYX_MESSAGING_PROFILE_ID or TELNYX_FROM');

  const payload = { to, text };
  if (mp) payload.messaging_profile_id = mp;
  if (from) payload.from = from;

  const res = await fetch('https://api.telnyx.com/v2/messages', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const body = await res.text();
  let data; try { data = JSON.parse(body); } catch { data = { raw: body }; }

  if (!res.ok) {
    console.error('[telnyx] send failed', { status: res.status, payload: { ...payload, text: undefined }, body: data });
    const err = new Error(`Telnyx error ${res.status}`);
    err.data = data;
    throw err;
  }
  console.log('[telnyx] sent', { id: data?.data?.id, to });
  return { provider: 'telnyx', raw: data };
}

async function sendSms(to, text){
  const dest = toE164(to);
  return await sendSmsTelnyx(dest, text);
}

module.exports = { sendSms, toE164 };
