
/**
 * db.js — Airtable-backed key/value JSON store
 * Env:
 *  AIRTABLE_API_KEY (PAT with data.records:read/write; base restricted)
 *  AIRTABLE_BASE_ID (appXXXXXXXXXXXXXX)
 *  AIRTABLE_TABLE   (default 'kv')
 *  AIRTABLE_TABLE_ID (optional tblXXXXXXXXXXXXXX — preferred if names change)
 */
const API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = process.env.AIRTABLE_BASE_ID;
const TABLE = process.env.AIRTABLE_TABLE || 'kv';
const TABLE_ID = process.env.AIRTABLE_TABLE_ID || null;

if(!API_KEY || !BASE_ID){
  console.warn('[db] Missing Airtable env. Set AIRTABLE_API_KEY and AIRTABLE_BASE_ID.');
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
  let data; try { data = JSON.parse(text); } catch { data = { raw: text }; }
  if(!res.ok){
    const err = new Error(`Airtable error ${res.status}`);
    err.details = { url, base: BASE_ID, table: TABLE, tableId: TABLE_ID || null, body: data };
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
  } else {
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
    await airtableFetch(`/${id}`, { method: 'DELETE' });
    return true;
  }catch(e){
    console.error('[db.deleteJson] failed', e.message, e.details || '');
    return false;
  }
}

async function listByPrefix(prefix, max=1000){
  const out = [];
  let offset = null;
  const formula = `LEFT({key}, LEN('${prefix.replace(/'/g, "\\'")}'))='${prefix.replace(/'/g, "\\'")}'`;
  do{
    const qs = `?pageSize=100&filterByFormula=${encodeURIComponent(formula)}`+(offset?`&offset=${encodeURIComponent(offset)}`:'');
    const r = await airtableFetch(qs, { method: 'GET' });
    for(const rec of (r.records||[])){
      out.push({ id: rec.id, key: rec.fields?.key || '', raw: rec });
    }
    offset = r.offset || null;
  }while(offset && out.length < max);
  return out;
}

async function batchDelete(ids=[]){
  let total = 0;
  for(let i=0;i<ids.length;i+=10){
    const chunk = ids.slice(i, i+10);
    const qs = '?' + chunk.map(id => `records[]=${encodeURIComponent(id)}`).join('&');
    try{
      const r = await airtableFetch(qs, { method: 'DELETE' });
      total += (r.records||[]).length;
    }catch(e){
      console.error('[db.batchDelete] chunk failed', chunk, e.message);
    }
  }
  return total;
}

// App helpers
async function getParticipants(){ return await readJson('participants.json', []); }
async function saveParticipants(list){ return await writeJson('participants.json', list); }
async function getSettings(){ return await readJson('settings.json', { week:0, entryFee:0, prizePoolOverride:null }); }
async function saveSettings(settings){ return await writeJson('settings.json', settings); }
async function saveAssignments(week, map){ return await writeJson(`assignments-week-${week}.json`, map); }
async function getAssignments(week){ return await readJson(`assignments-week-${week}.json`, null); }
async function getPurge(){ return await readJson('purge.json', { active:false }); }
async function savePurge(obj){ return await writeJson('purge.json', obj); }
async function clearPurge(){ return await deleteJson('purge.json'); }
async function deleteByPrefix(prefix){ const recs = await listByPrefix(prefix); return { attempted: recs.length, deleted: await batchDelete(recs.map(r=>r.id)) }; }

module.exports = {
  getParticipants, saveParticipants,
  getSettings, saveSettings,
  saveAssignments, getAssignments,
  getPurge, savePurge, clearPurge,
  deleteJson, deleteByPrefix
};
