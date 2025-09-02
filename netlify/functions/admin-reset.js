
const { saveParticipants, clearPurge, listByPrefix, batchDelete } = require('./db');
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return j(405, { ok:false, error:'Method Not Allowed' });
  const secret = event.headers['x-admin-secret'] || event.headers['X-Admin-Secret'];
  if (!process.env.ADMIN_PASSWORD || secret !== process.env.ADMIN_PASSWORD) return j(401, { ok:false, error:'unauthorized' });
  await saveParticipants([]);
  await clearPurge();
  // delete assignments & status files
  const assign = await listByPrefix('assignments-week-');
  const stat = await listByPrefix('status-week-');
  await batchDelete(assign.map(r=>r.id));
  await batchDelete(stat.map(r=>r.id));
  return j(200, { ok:true, reset:true, deleted: { assignments: assign.length, statuses: stat.length } });
};
const j = (s,b)=>({ statusCode:s, headers:{'content-type':'application/json'}, body: JSON.stringify(b, null, 2) });
