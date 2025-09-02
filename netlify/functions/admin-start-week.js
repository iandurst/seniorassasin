
const { getParticipants, saveAssignments, getAssignments } = require('./db');
function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
exports.handler = async (event) => {
  try{
    if (event.httpMethod !== 'POST') return j(405, { ok:false, error:'Method Not Allowed' });
    const secret = event.headers['x-admin-secret'] || event.headers['X-Admin-Secret'];
    if (!process.env.ADMIN_PASSWORD || secret !== process.env.ADMIN_PASSWORD) return j(401, { ok:false, error:'unauthorized' });
    const body = JSON.parse(event.body || '{}');
    const week = Number(body.week || 0);
    if (!week || week < 1) return j(400, { ok:false, error:'Invalid week' });
    const existing = await getAssignments(week);
    if (existing) return j(200, { ok:true, existed:true, pairs: existing.pairs || [], week });
    const people = (await getParticipants()).filter(p => p && p.phone);
    if (people.length < 2) return j(400, { ok:false, error:'Need at least 2 participants' });
    const order = shuffle(people.slice());
    const pairs = order.map((hunter, i) => {
      const target = order[(i+1) % order.length];
      return { hunter: { name: hunter.name||'', phone: hunter.phone }, target: { name: target.name||'', phone: target.phone } };
    });
    await saveAssignments(week, { week, createdAt: new Date().toISOString(), pairs });
    return j(200, { ok:true, week, pairs });
  }catch(e){
    return j(500, { ok:false, error: e.message });
  }
};
const j = (s,b)=>({ statusCode:s, headers:{'content-type':'application/json'}, body: JSON.stringify(b, null, 2) });
