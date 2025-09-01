const { ok, bad, notAllowed, requireAdmin } = require('./util');
const { getParticipants, getSettings, saveSettings, getCurrentVote, saveCurrentVote } = require('./db');
const twilio = require('twilio');
const crypto = require('crypto');

function tzParts(date = new Date(), tz = 'America/Chicago'){
  const fmt = new Intl.DateTimeFormat('en-US', { timeZone: tz, year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false, weekday:'long' });
  const parts = Object.fromEntries(fmt.formatToParts(date).map(p => [p.type, p.value]));
  const weekday = parts.weekday.toLowerCase();
  const [month, day, year] = [parts.month, parts.day, parts.year].map(Number);
  const [hour, minute, second] = [parts.hour, parts.minute, parts.second].map(Number);
  return { weekday, year, month, day, hour, minute, second };
}

function isFriday3pmCentral(now=new Date()){
  const p = tzParts(now, 'America/Chicago');
  return p.weekday === 'friday' && p.hour === 15;
}

function addHours(date, h){
  return new Date(date.getTime() + h*3600*1000);
}

function token(){
  return crypto.randomBytes(16).toString('hex');
}

async function sendSms(to, body){
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if(!sid || !token){
    console.log('[SMS] Twilio not configured; skipping send to', to, body);
    return { skipped: true };
  }
  const client = twilio(sid, token);
  const msg = { to, body };
  if(process.env.TWILIO_MESSAGING_SERVICE_SID){
    msg.messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
  }else if(process.env.TWILIO_FROM_NUMBER){
    msg.from = process.env.TWILIO_FROM_NUMBER;
  }else{
    console.log('[SMS] No message sender configured; skipping');
    return { skipped: true };
  }
  return await client.messages.create(msg);
}

exports.handler = async (event) => {
  if(event.httpMethod !== 'POST') return notAllowed();

  // Allow if admin OR scheduled invocation (Netlify adds x-nf-schedule for cron)
  const isScheduled = !!event.headers['x-nf-schedule'];
  if(!isScheduled){
    try{ requireAdmin(event, process.env); }catch{ return bad('Unauthorized', 401); }
  }

  const settings = await getSettings();
  if(settings.gameOver) return bad('Game already ended.', 400);

  const now = new Date();
  if(isScheduled && !isFriday3pmCentral(now)){
    return ok({ skipped:true, reason:'Not Friday 3pm Central' });
  }

  const current = await getCurrentVote();
  if(current && current.status === 'open'){
    return bad('A vote is already open.', 400);
  }

  const players = (await getParticipants()).filter(p => p.status === 'active' && p.alive);
  if(players.length === 0) return bad('No eligible players.', 400);

  const startAt = now.toISOString();
  const endAt = addHours(now, 3).toISOString();
  const id = `vote-${now.toISOString()}`;

  const tokenMap = {};
  players.forEach(p => { tokenMap[token()] = p.id; });

  const vote = {
    id,
    status: 'open',
    startAt, endAt,
    eligibleCount: players.length,
    tokenMap,
    votes: {}, // pid -> 'stop'|'continue'
    counts: { stop: 0, continue: 0 },
    threshold: Math.ceil(players.length * 0.75)
  };

  await saveCurrentVote(vote);

  const base = process.env.SITE_BASE_URL || process.env.URL || process.env.DEPLOY_PRIME_URL || '';
  for(const [tok, pid] of Object.entries(tokenMap)){
    const p = players.find(pp => pp.id === pid);
    const url = base ? `${base.replace(/\/$/,'')}/vote.html?token=${tok}` : `Token: ${tok}`;
    const body = base ? `PCS Senior Assasin: voting is OPEN 3–6pm CT. Cast your vote: ${url}` : `PCS Senior Assasin: voting is OPEN 3–6pm CT. ${url}`;
    try{ await sendSms(p.phone, body); }catch(e){ console.error('SMS vote send fail', p.phone, e.message); }
  }

  return ok({ opened: true, id, startAt, endAt, eligible: players.length, threshold: vote.threshold, scheduled: isScheduled });
};
