
const { ok } = require('./util');
exports.handler = async () => {
  const apiKey = !!process.env.TELNYX_API_KEY;
  const mp = !!process.env.TELNYX_MESSAGING_PROFILE_ID;
  const from = !!process.env.TELNYX_FROM;
  const notes = [];
  if(!apiKey) notes.push('Set TELNYX_API_KEY');
  if(!mp && !from) notes.push('Set TELNYX_MESSAGING_PROFILE_ID or TELNYX_FROM');
  notes.push('For US local 10-digit senders, complete 10DLC registration or use a verified toll-free number.');
  return ok({ ok: notes.length === 1, checks: { apiKey, messaging_profile: mp, from }, notes });
};
