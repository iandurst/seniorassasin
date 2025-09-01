// netlify/functions/db.js
// FIX: Ensure Netlify Blobs works in environments where automatic configuration is missing
// by explicitly passing siteID and token (via environment variables) to getStore.

const { getStore } = require('@netlify/blobs');

const STORE_NAME = 'pcs-senior-assassin';

// Prefer explicit credentials (NETLIFY_SITE_ID + NETLIFY_BLOBS_TOKEN or NETLIFY_API_TOKEN).
// On Netlify, NETLIFY_SITE_ID is set automatically. Add NETLIFY_BLOBS_TOKEN in Site settings > Environment variables.
const store = getStore({
  name: STORE_NAME,
  siteID: process.env.NETLIFY_SITE_ID,
  token: process.env.NETLIFY_BLOBS_TOKEN || process.env.NETLIFY_API_TOKEN
});

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
  const defaults = { entryFee: 5, prizePoolOverride: null, week: 0, lastStart: null, gameEnded: false };
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
async function getVotes(key){
  return await readJson(`votes-${key}.json`, { key, votes: {}, counts: { stop: 0, continue: 0 } });
}
async function saveVotes(key, value){
  return await writeJson(`votes-${key}.json`, value);
}

module.exports = { getParticipants, saveParticipants, getSettings, saveSettings, saveAssignments, getAssignments, getVotes, saveVotes };