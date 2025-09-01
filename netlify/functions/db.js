const { getStore } = require('@netlify/blobs');

const store = getStore({ name: 'pcs-senior-assassin' });

async function readJson(key, fallback){
  const data = await store.get(key, { type: 'json' });
  return data ?? fallback;
}

async function writeJson(key, value){
  // Ensure JSON content type; store.set expects string if contentType provided.
  await store.set(key, JSON.stringify(value), { contentType: 'application/json' });
  return value;
}

async function getParticipants(){
  return await readJson('participants.json', []);
}
async function saveParticipants(list){
  return await writeJson('participants.json', list);
}
async function getSettings(){
  const defaults = { entryFee: 0, prizePoolOverride: null, week: 0, lastStart: null };
  const s = await readJson('settings.json', defaults);
  return Object.assign({}, defaults, s || {});
}
async function saveSettings(s){
  return await writeJson('settings.json', s);
}
async function saveAssignments(week, map){
  return await writeJson(`assignments-week-${week}.json`, map);
}
async function getAssignments(week){
  return await readJson(`assignments-week-${week}.json`, null);
}

module.exports = { getParticipants, saveParticipants, getSettings, saveSettings, saveAssignments, getAssignments };
