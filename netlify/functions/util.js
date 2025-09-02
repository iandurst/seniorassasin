const crypto = require('crypto');

function ok(body={}, statusCode=200){
  return { statusCode, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) };
}
function bad(error='Bad Request', statusCode=400){
  return ok({ ok:false, error }, statusCode);
}
function notAllowed(){ return bad('Method not allowed', 405); }

function parse(event){
  try{ return JSON.parse(event.body || '{}') }catch{ return {} }
}

function id(){ return crypto.randomUUID ? crypto.randomUUID() : (Date.now().toString(36) + Math.random().toString(36).slice(2,8)); }

function cleanPhone(input){
  if(!input) return null;
  const digits = String(input).replace(/\D+/g, '');
  if(digits.length === 10) return '+1' + digits; // assume US if 10 digits
  if(digits.length === 11 && digits.startsWith('1')) return '+' + digits; // 1XXXXXXXXXX
  if(digits.length >= 11) return '+' + digits; // naive fallback
  return null;
}

function requireAdmin(event, env){
  const supplied = event.headers['x-admin-secret'] || event.headers['X-Admin-Secret'] || event.headers['x-admin-secret'.toLowerCase()];
  const expected = process.env.ADMIN_PASSWORD || 'Slapshot2007';
  if(!supplied || supplied !== expected) throw new Error('Unauthorized');
}

// Voting window helpers (America/Chicago)
function chicagoParts(d = new Date()){
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago', hour12: false,
    weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  }).formatToParts(d);
  const get = (t) => Number(parts.find(p => p.type === t).value);
  const weekday = parts.find(p => p.type === 'weekday').value; // 'Fri'
  return { weekday, year: get('year'), month: get('month'), day: get('day'), hour: get('hour'), minute: get('minute') };
}

function isVotingOpen(now = new Date()){
  const p = chicagoParts(now);
  if(p.weekday !== 'Fri') return false;
  return p.hour >= 15 && p.hour < 18; // 3:00–5:59 pm CT inclusive
}

function votingKey(now = new Date()){
  const p = chicagoParts(now);
  const mm = String(p.month).padStart(2,'0');
  const dd = String(p.day).padStart(2,'0');
  return `${p.year}-${mm}-${dd}`;
}

module.exports = { ok, bad, notAllowed, parse, id, cleanPhone, requireAdmin, chicagoParts, isVotingOpen, votingKey };
