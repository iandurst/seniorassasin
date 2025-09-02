
// /.netlify/functions/admin-reset
const { saveParticipants, saveSettings, deleteByPrefix, clearPurge } = require('./db');

exports.handler = async (event) => {
  try{
    if (event.httpMethod !== 'POST') return json(405, { ok:false, error:'Method Not Allowed' });
    const secret = event.headers['x-admin-secret'] || event.headers['X-Admin-Secret'];
    if (!process.env.ADMIN_PASSWORD || secret !== process.env.ADMIN_PASSWORD) {
      return json(401, { ok:false, error: 'unauthorized' });
    }

    await saveParticipants([]);
    await saveSettings({ week:0, entryFee:0, prizePoolOverride:null });
    await clearPurge();
    const d1 = await deleteByPrefix('assignments-week-');
    const d2 = await deleteByPrefix('votes-');

    return json(200, { ok:true, reset:true, deleted:{ assignments:d1, votes:d2 } });
  }catch(e){
    console.error('[admin-reset] error', e);
    return json(500, { ok:false, error: e.message });
  }
};

function json(status, body){
  return { statusCode: status, headers: { 'content-type':'application/json' }, body: JSON.stringify(body,null,2) };
}
