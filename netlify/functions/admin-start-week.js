
// /.netlify/functions/admin-start-week — generate and save assignments for a week
const { getParticipants, saveAssignments, getAssignments } = require('./db');

function shuffle(array){
  for(let i = array.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

exports.handler = async (event) => {
  try{
    if (event.httpMethod !== 'POST') return json(405, { ok:false, error:'Method Not Allowed' });
    const secret = event.headers['x-admin-secret'] || event.headers['X-Admin-Secret'];
    if (!process.env.ADMIN_PASSWORD || secret !== process.env.ADMIN_PASSWORD) {
      return json(401, { ok:false, error: 'unauthorized' });
    }
    const input = JSON.parse(event.body || '{}');
    const week = Number(input.week || 0);
    const force = !!input.force;

    if (!week || week < 1) return json(400, { ok:false, error:'Invalid week number' });

    const existing = await getAssignments(week);
    if (existing && !force) {
      return json(200, { ok:true, existed:true, pairs: existing.pairs || [], week: existing.week });
    }

    const people = (await getParticipants()).filter(p => p && p.phone);
    if (people.length < 2) return json(400, { ok:false, error:'Need at least 2 participants' });

    const order = shuffle(people.slice());
    const pairs = order.map((hunter, i) => {
      const target = order[(i+1) % order.length];
      return {
        hunter: { name: hunter.name || '', phone: hunter.phone },
        target: { name: target.name || '', phone: target.phone }
      };
    });

    const saved = { week, createdAt: new Date().toISOString(), count: pairs.length, pairs };
    await saveAssignments(week, saved);
    return json(200, { ok:true, week, pairs });
  }catch(e){
    console.error('[admin-start-week] error', e);
    return json(500, { ok:false, error: e.message });
  }
};

function json(status, body){
  return { statusCode: status, headers: { 'content-type':'application/json' }, body: JSON.stringify(body, null, 2) };
}
