
/**
 * db.js — Airtable-backed key/value JSON store (replaces Netlify Blobs)
 * Env:
 *  AIRTABLE_API_KEY   (PAT with data.records:read/write; restricted to this base)
 *  AIRTABLE_BASE_ID   (appXXXXXXXXXXXXXX)
 *  AIRTABLE_TABLE     (defaults to 'kv')
 *  AIRTABLE_TABLE_ID  (optional, tblXXXXXXXXXXXXXX; preferred if table names may change)
 */
const API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = process.env.AIRTABLE_BASE_ID;
const TABLE = process.env.AIRTABLE_TABLE || 'kv';
const TABLE_ID = process.env.AIRTABLE_TABLE_ID || null;

if(!API_KEY || !BASE_ID){
  console.warn('[db] Missing Airtable configuration. Set AIRTABLE_API_KEY and AIRTABLE_BASE_ID.');
}

const TABLE_PATH = encodeURIComponent(TABLE_ID || TABLE);
const API_ROOT = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_PATH}`;

async function airtableFetch(path, opts={}){
  const url = `${API_ROOT}${path||''}`;
  const res = await fetch(url, {
    ...opts,
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      ...(opts.headers||{})
    }
  });
  const text = await res.text().catch(()=> '');
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  if(!res.ok){
    const err = new Error(`Airtable error ${res.status}`);
    err.details = { url, base: BASE_ID, table: TABLE, tableId: TABLE_ID || null, body: (typeof data === 'string' ? data.slice(0, 300) : data) };
    throw err;
  }
  return data;
}

async function findRecordIdByKey(key){
  const sanitized = String(key).replace(/'/g, "\\'");
  const formula = encodeURIComponent(`{key}='${sanitized}'`);
  const data = await airtableFetch(`?maxRecords=1&filterByFormula=${formula}`, { method:'GET' });
  const rec = (data.records && data.records[0]) || null;
  return rec ? rec.id : null;
}

async function readJson(key, fallback){
  try{
    const sanitized = String(key).replace(/'/g, "\\'");
    const formula = encodeURIComponent(`{key}='${sanitized}'`);
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

async function deleteJson(key){
  try{
    const id = await findRecordIdByKey(key);
    if(!id) return false;
    const url = `/${encodeURIComponent(id)}`;
    await airtableFetch(url, { method: 'DELETE' });
    return true;
  }catch(e){
    console.error('[db.deleteJson] failed', e.message, e.details || '');
    return false;
  }
}

async function listByPrefix(prefix, max=1000){
  const results = [];
  let offset = null;
  const formula = `LEFT({key}, LEN('${prefix.replace(/'/g, "\\'")}'))='${prefix.replace(/'/g, "\\'")}'`;
  do {
    const qs = `?pageSize=100&filterByFormula=${encodeURIComponent(formula)}` + (offset ? `&offset=${encodeURIComponent(offset)}` : '');
    const data = await airtableFetch(qs, { method: 'GET' });
    for(const rec of (data.records||[])){
      results.push({ id: rec.id, key: (rec.fields && rec.fields.key) || '', raw: rec });
    }
    offset = data.offset || null;
  } while(offset && results.length < max);
  return results;
}

async function batchDelete(ids=[]){
  const chunks = [];
  for(let i=0;i<ids.length;i+=10) chunks.push(ids.slice(i, i+10));
  let total = 0;
  for(const chunk of chunks){
    const qs = '?' + chunk.map(id => `records[]=${encodeURIComponent(id)}`).join('&');
    try{
      const data = await airtableFetch(qs, { method: 'DELETE' });
      total += (data.records || []).length;
    }catch(e){
      console.error('[db.batchDelete] failed chunk', chunk, e.message);
    }
  }
  return total;
}

// High-level helpers expected by the rest of the codebase
async function getParticipants(){ return await readJson('participants.json', []); }
async function saveParticipants(list){ return await writeJson('participants.json', list); }

async function getSettings(){
  const defaults = { entryFee: 5, prizePoolOverride: null, week: 0, lastStart: null, gameEnded: false };
  const s = await readJson('settings.json', defaults);
  return Object.assign({}, defaults, s || {});
}
async function saveSettings(settings){ return await writeJson('settings.json', settings); }

async function saveAssignments(week, map){ return await writeJson(`assignments-week-${week}.json`, map); }
async function getAssignments(week){ return await readJson(`assignments-week-${week}.json`, null); }

async function getVotes(key){ return await readJson(`votes-${key}.json`, { key, votes: {}, counts: { stop: 0, continue: 0 } }); }
async function saveVotes(key, value){ return await writeJson(`votes-${key}.json`, value); }

// Admin helpers used by new features
async function deleteByPrefix(prefix){ 
  const recs = await listByPrefix(prefix);
  const ids = recs.map(r => r.id);
  const n = await batchDelete(ids);
  return { deleted: n, attempted: ids.length };
}

async function getPurge(){ return await readJson('purge.json', { active:false }); }
async function savePurge(obj){ return await writeJson('purge.json', obj); }
async function clearPurge(){ return await deleteJson('purge.json'); }

module.exports = { 
  getParticipants, saveParticipants, 
  getSettings, saveSettings,
  saveAssignments, getAssignments,
  getVotes, saveVotes,
  deleteJson, deleteByPrefix, listByPrefix,
  getPurge, savePurge, clearPurge
};
