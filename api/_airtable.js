const Airtable = require('airtable');
const { DateTime } = require('luxon');

const apiKey = process.env.AIRTABLE_API_KEY;
const baseId = process.env.AIRTABLE_BASE_ID;
const tz = process.env.TIMEZONE || 'America/Chicago';
const prizePerElim = parseInt(process.env.PRIZE_PER_ELIMINATION || '5', 10);
const basePrize = parseInt(process.env.BASE_PRIZE || '0', 10);

if(!apiKey || !baseId){
  console.warn('Missing Airtable env vars. Set AIRTABLE_API_KEY and AIRTABLE_BASE_ID.');
}

const base = new Airtable({ apiKey }).base(baseId);

async function getSettings(){
  const map = {};
  const rows = await base('Settings').select({}).all();
  rows.forEach(r => { map[r.get('Key')] = r.get('Value'); });
  return map;
}

async function setSetting(key, value){
  // try update existing
  const existing = await base('Settings').select({ filterByFormula: `{Key} = '${key}'` }).firstPage();
  if(existing && existing[0]){
    await base('Settings').update(existing[0].id, { 'Value': String(value) });
  }else{
    await base('Settings').create({ 'Key': key, 'Value': String(value) });
  }
  return true;
}

function nowChicago(){
  return DateTime.now().setZone(tz);
}

function statusFlags(){
  const now = nowChicago();
  const weekday = now.weekday; // 1=Mon .. 7=Sun
  const isSaturday = (weekday === 6);
  const isSunday = (weekday === 7);
  const hour = now.hour;
  const isPurgeActive = isSaturday && hour >= 8 && hour < 24;
  const isSundayVoting = isSunday;
  return { now, isPurgeActive, isSundayVoting };
}

async function listParticipants(){
  const rows = await base('Participants').select({}).all();
  return rows.map(r => ({
    id: r.id,
    FirstName: r.get('FirstName') || '',
    LastName: r.get('LastName') || '',
    Phone: r.get('Phone') || '',
    Verified: !!r.get('Verified'),
    Status: r.get('Status') || 'Pending',
    Eliminations: r.get('Eliminations') || 0,
    Alive: !!r.get('Alive'),
    WeekEliminated: r.get('WeekEliminated') || null
  }));
}

async function leaderboard(){
  const participants = await listParticipants();
  // Only include verified? Show all for transparency; sort by eliminations desc, then name
  const lb = participants.sort((a,b)=> (b.Eliminations||0)-(a.Eliminations||0) || (a.LastName||'').localeCompare(b.LastName||''));
  return lb;
}

async function totalEliminations(){
  // Count rows in Eliminations table
  try{
    const rows = await base('Eliminations').select({}).all();
    return rows.length;
  }catch(e){
    // fallback: sum from participants
    const parts = await listParticipants();
    return parts.reduce((s,p)=> s + (parseInt(p.Eliminations||0,10)||0), 0);
  }
}

async function prizePool(){
  const elimCount = await totalEliminations();
  const prize = basePrize + (elimCount * prizePerElim);
  return { prizePool: prize, prizePerElimination: prizePerElim, eliminations: elimCount };
}

async function findParticipantByPhone(phoneDigits){
  const rows = await base('Participants').select({ filterByFormula: `{Phone} = '${phoneDigits}'` }).all();
  return rows[0];
}

module.exports = {
  base,
  getSettings,
  setSetting,
  nowChicago,
  statusFlags,
  listParticipants,
  leaderboard,
  prizePool,
  findParticipantByPhone
};
