
const { ok, bad, notAllowed, requireAdmin, initBlobs } = require('./util');
const { getParticipants, getSettings, saveSettings, saveAssignments } = require('./db');

function shuffle(a){ for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]] } return a }

async function sendSms(to, body){
  const apiKey = process.env.TELNYX_API_KEY;
  const from = process.env.TELNYX_FROM_NUMBER;
  const profile = process.env.TELNYX_MESSAGING_PROFILE_ID;
  if(!apiKey){ console.log('[SMS] Telnyx not configured; skipping', to); return { skipped:true } }
  if(!from && !profile){ console.log('[SMS] Need TELNYX_FROM_NUMBER or TELNYX_MESSAGING_PROFILE_ID'); return { skipped:true } }
  const payload = { to, text: body }; if(from) payload.from = from; if(profile) payload.messaging_profile_id = profile;
  const res = await fetch('https://api.telnyx.com/v2/messages',{ method:'POST', headers:{ 'Authorization':`Bearer ${apiKey}`,'Content-Type':'application/json' }, body: JSON.stringify(payload) });
  if(!res.ok){ const t = await res.text().catch(()=> ''); throw new Error(`Telnyx send failed: ${res.status} ${t}`) } return await res.json();
}

exports.handler = async (event) => {
  initBlobs(event);
  if(event.httpMethod !== 'POST') return notAllowed();
  try{ requireAdmin(event) }catch{ return bad('Unauthorized', 401) }

  const settings = await getSettings();
  if(settings.gameOver) return bad('Game has ended.');

  const players = (await getParticipants()).filter(p => p.status === 'active' && p.alive);
  if(players.length < 2) return bad('Need at least 2 active, alive players to start a week.');

  const arr = shuffle(players.map(p=>p.id)); const map = new Map();
  for(let i=0;i<arr.length;i++){ map.set(arr[i], arr[(i+1)%arr.length]); }

  settings.week = (settings.week||0)+1; settings.lastStart = new Date().toISOString();
  await saveSettings(settings); await saveAssignments(settings.week, Object.fromEntries(map.entries()));

  const look = Object.fromEntries(players.map(p=>[p.id,p])); const assignments=[];
  for(const [hunterId, targetId] of map.entries()){
    const hunter=look[hunterId], target=look[targetId];
    const body = `Your target is ${target.firstName} ${target.lastName}, good luck`;
    try{ await sendSms(hunter.phone, body); assignments.push({ hunterName:`${hunter.firstName} ${hunter.lastName}`, targetName:`${target.firstName} ${target.lastName}` }) }
    catch(err){ console.error('SMS failed for', hunter.phone, err.message); assignments.push({ hunterName:`${hunter.firstName} ${hunter.lastName}`, targetName:`${target.firstName} ${target.lastName}`, smsError:true }) }
  }
  return ok({ week: settings.week, assignments });
};
