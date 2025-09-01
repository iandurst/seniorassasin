const { getStore } = require('@netlify/blobs');

const store = getStore({ name: 'pcs-senior-assassin' });

async function readJson(key, fallback){
  const data = await store.get(key, { type: 'json' });
  return data ?? fallback;
}

async function writeJson(key, value){
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
  const defaults = { entryFee: 5, prizePoolOverride: null, week: 0, lastStart: null, gameOver: false, endedAt: null };
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

async function getVoteState(){
  return await readJson('vote.json', null);
}
async function saveVoteState(state){
  return await writeJson('vote.json', state);
}

module.exports = { getParticipants, saveParticipants, getSettings, saveSettings, saveAssignments, getAssignments, getVoteState, saveVoteState };
