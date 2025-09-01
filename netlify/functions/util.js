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

module.exports = { ok, bad, notAllowed, parse, id, cleanPhone, requireAdmin };
