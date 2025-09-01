
const crypto = require('crypto');
function ok(body={}, statusCode=200){ return { statusCode, headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) } }
function bad(error='Bad Request', statusCode=400){ return ok({ ok:false, error }, statusCode) }
function notAllowed(){ return bad('Method not allowed', 405) }
function parse(event){ try{ return JSON.parse(event.body||'{}') }catch{ return {} } }
function id(){ return crypto.randomUUID ? crypto.randomUUID() : (Date.now().toString(36)+Math.random().toString(36).slice(2,8)) }
function cleanPhone(input){ if(!input) return null; const d=String(input).replace(/\D+/g,''); if(d.length===10) return '+1'+d; if(d.length===11&&d.startsWith('1')) return '+'+d; if(d.length>=11) return '+'+d; return null }
function requireAdmin(event){ const s=event.headers['x-admin-secret']||event.headers['X-Admin-Secret']; const exp=process.env.ADMIN_PASSWORD||''; if(!exp||s!==exp) throw new Error('Unauthorized') }
const { connectLambda } = require('@netlify/blobs');
function initBlobs(event){ try{ connectLambda(event) }catch{} }
module.exports = { ok, bad, notAllowed, parse, id, cleanPhone, requireAdmin, initBlobs };
