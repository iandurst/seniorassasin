
// /.netlify/functions/telnyx-health
exports.handler = async () => {
  const out = {
    apiKey: !!process.env.TELNYX_API_KEY,
    messagingProfileId: !!process.env.TELNYX_MESSAGING_PROFILE_ID,
    fromNumber: !!process.env.TELNYX_FROM,
    defaultCountryCode: process.env.DEFAULT_COUNTRY_CODE || '+1',
    note: 'You must set either TELNYX_MESSAGING_PROFILE_ID or TELNYX_FROM. For US local 10DLC, register brand/campaign or use a verified toll-free number.'
  };
  const ok = !!process.env.TELNYX_API_KEY && (!!process.env.TELNYX_MESSAGING_PROFILE_ID || !!process.env.TELNYX_FROM);
  return { statusCode: 200, headers: { 'content-type':'application/json' }, body: JSON.stringify({ ok, checks: out }, null, 2) };
};
