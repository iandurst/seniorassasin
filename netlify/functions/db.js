/**
 * db.js — replace Netlify Blobs with Airtable-backed key/value JSON store.
 *
 * Airtable setup:
 *  1) Create a Base and a Table named "kv".
 *  2) Add fields: key (Single line text), value (Long text)
 *  3) Set env vars: AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE (optional)
 */
const API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = process.env.AIRTABLE_BASE_ID;
const TABLE = process.env.AIRTABLE_TABLE || 'kv';

if(!API_KEY || !BASE_ID){
  console.warn('[db] Missing Airtable configuration. Set AIRTABLE_API_KEY and AIRTABLE_BASE_ID.');
}

const API_ROOT = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE)}`;

async function airtableFetch(path, opts={}){
  const res = await fetch(`${API_ROOT}${path||''}`, {
    ...opts,
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      ...(opts.headers||{})
    }
  });
  const data = await res.json().catch(()=> ({}));
  if(!res.ok){
    const err = new Error(`Airtable error ${res.status}`);
    err.data = data;
    throw err;
  }
  return data;
}

async function findRecordIdByKey(key){
  const formula = encodeURIComponent(`{key}='${String(key).replace(/'/g, "\'")}'`);
  const data = await airtableFetch(`?maxRecords=1&filterByFormula=${formula}`, { method:'GET' });
  const rec = (data.records && data.records[0]) || null;
  return rec ? rec.id : null;
}

async function readJson(key, fallback){
  try{
    const formula = encodeURIComponent(`{key}='${String(key).replace(/'/g, "\'")}'`);
    const data = await airtableFetch(`?maxRecords=1&filterByFormula=${formula}`, { method:'GET' });
    const rec = (data.records && data.records[0]) || null;
    if(!rec) return fallback;
    const raw = rec.fields && rec.fields.value;
    if(!raw) return fallback;
    try{ return JSON.parse(raw); }catch{ return fallback; }
  }catch(e){
    console.error('[db.readJson] failed', e.message);
    return fallback;
  }
}

async function writeJson(key, value){
  const valueStr = JSON.stringify(value);
  const id = await findRecordIdByKey(key);
  if(id){
    await airtableFetch('', {
      method: 'PATCH',
      body: JSON.stringify({ records: [{ id, fields: { value: valueStr } }] })
    });
    return value;
  }else{
    await airtableFetch('', {
      method: 'POST',
      body: JSON.stringify({ records: [{ fields: { key, value: valueStr } }] })
    });
    return value;
  }
}

// High-level helpers (same API as before)
async function getParticipants(){ return await readJson('participants.json', []); }
async function saveParticipants(list){ return await writeJson('participants.json', list); }
async function getSettings(){ return await readJson('settings.json', { week: 0, entryFee: 0, prizePoolOverride: null }); }
async function saveSettings(settings){ return await writeJson('settings.json', settings); }
async function saveAssignments(week, map){ return await writeJson(`assignments-week-${week}.json`, map); }
async function getAssignments(week){ return await readJson(`assignments-week-${week}.json`, null); }
async function getVotes(key){ return await readJson(`votes-${key}.json`, { key, votes: {}, counts: { stop: 0, continue: 0 } }); }
async function saveVotes(key, value){ return await writeJson(`votes-${key}.json`, value); }

module.exports = { getParticipants, saveParticipants, getSettings, saveSettings, saveAssignments, getAssignments, getVotes, saveVotes };
