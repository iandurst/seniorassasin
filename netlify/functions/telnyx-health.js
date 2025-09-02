
// netlify/functions/telnyx-health.js
exports.handler = async () => {
  const apiKey = process.env.TELNYX_API_KEY ? 'present' : 'missing';
  const mp = process.env.TELNYX_MESSAGING_PROFILE_ID ? 'present' : 'missing';
  const from = process.env.TELNYX_FROM ? 'present' : 'missing';
  const notes = [];
  if(apiKey === 'missing') notes.push('Set TELNYX_API_KEY');
  if(mp === 'missing' && from === 'missing') notes.push('Set TELNYX_MESSAGING_PROFILE_ID or TELNYX_FROM');
  notes.push('Ensure 10DLC campaign registration or use a verified toll-free number in the U.S.');
  return {
    statusCode: 200,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ok: notes.length === 1, checks: { apiKey, messaging_profile: mp, from }, notes }, null, 2)
  };
};
