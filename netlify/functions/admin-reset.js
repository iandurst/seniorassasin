
// netlify/functions/admin-reset.js
const { 
  deleteJson, deleteByPrefix, saveSettings, savePurge, clearPurge, saveParticipants 
} = require('./db');

exports.handler = async (event) => {
  try{
    if (event.httpMethod && event.httpMethod !== 'POST') {
      return resp(405, { ok:false, error: 'Method Not Allowed' });
    }
    const adminToken = event.headers['x-admin-token'] || event.headers['X-Admin-Token'] || event.queryStringParameters?.token;
    if (!process.env.ADMIN_TOKEN || adminToken !== process.env.ADMIN_TOKEN) {
      return resp(401, { ok:false, error: 'Unauthorized' });
    }

    // Clear core data
    const deleted = {};
    const participantsCleared = await saveParticipants([]); // reset list
    deleted['participants.json'] = 'reset';

    const defaultSettings = { week: 0, entryFee: 0, prizePoolOverride: null };
    await saveSettings(defaultSettings);
    deleted['settings.json'] = 'reset';

    // remove purge state
    await clearPurge();

    // delete assignments and votes by prefix
    const delAssign = await deleteByPrefix('assignments-week-');
    const delVotes = await deleteByPrefix('votes-');

    deleted['assignments-week-*'] = delAssign;
    deleted['votes-*'] = delVotes;
    deleted['purge.json'] = 'deleted';

    return resp(200, { ok:true, deleted, msg: 'All core data reset.' });
  }catch(e){
    console.error('[admin-reset] failed', e.message, e.stack);
    return resp(500, { ok:false, error: e.message });
  }
};

function resp(status, body){
  return { statusCode: status, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body, null, 2) };
}
