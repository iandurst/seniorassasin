
// sms.js — Telnyx SMS helper for Netlify Functions
// Env:
//   TELNYX_API_KEY
//   TELNYX_MESSAGING_PROFILE_ID (or TELNYX_FROM)
//   TELNYX_FROM (E.164 or approved alphanumeric where supported)
//   DEFAULT_COUNTRY_CODE (optional; default '+1')

function toE164(input, defaultCC = (process.env.DEFAULT_COUNTRY_CODE || '+1')) {
  if (!input) return input;
  const s = String(input).trim();
  if (s.startsWith('+')) return s;
  const digits = s.replace(/\D/g, '');
  if (!digits) return input;
  // US default: 10 digits -> +1xxxxxxxxxx
  if (digits.length === 10 && defaultCC === '+1') return defaultCC + digits;
  if (!s.startsWith('+')) return `+${digits}`;
  return s;
}

async function sendSms_telnyx(to, body) {
  const apiKey = process.env.TELNYX_API_KEY;
  const mp = process.env.TELNYX_MESSAGING_PROFILE_ID;
  const from = process.env.TELNYX_FROM;
  if (!apiKey) throw new Error('Missing TELNYX_API_KEY');
  if (!mp && !from) throw new Error('You must set TELNYX_MESSAGING_PROFILE_ID or TELNYX_FROM');

  const payload = { to, text: body };
  if (mp) payload.messaging_profile_id = mp;
  if (from) payload.from = from;

  const url = 'https://api.telnyx.com/v2/messages';
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const text = await res.text();
  let data; try { data = JSON.parse(text); } catch { data = { raw: text }; }

  if (!res.ok) {
    console.error('[telnyx] send failed', { status: res.status, body: data, payload: { ...payload, text: undefined } });
    const err = new Error(`Telnyx error ${res.status}`);
    err.data = data;
    throw err;
  }

  console.log('[telnyx] sent', { id: data?.data?.id, to });
  return { provider: 'telnyx', raw: data };
}

async function sendSms(to, body) {
  const dest = toE164(to);
  return await sendSms_telnyx(dest, body);
}

async function sendBulkSms(numbers = [], body, opts = { concurrency: 5 }) {
  const limit = Math.max(1, Number(opts.concurrency || 5));
  let active = 0, i = 0, results = [];
  return await new Promise((resolve) => {
    const runNext = () => {
      if (i >= numbers.length && active === 0) return resolve(results);
      while (active < limit && i < numbers.length) {
        const n = numbers[i++];
        active++;
        sendSms(n, body)
          .then(r => results.push({ to: n, ok: true, id: r.raw?.data?.id || null }))
          .catch(e => results.push({ to: n, ok: false, error: e.message, details: e.data || null }))
          .finally(() => { active--; runNext(); });
      }
    };
    runNext();
  });
}

module.exports = { sendSms, sendBulkSms, toE164 };
