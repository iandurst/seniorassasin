// util shared across pages
const API_BASE = '/.netlify/functions';
const ADMIN_KEY = 'pcs_admin_secret';

function currency(n){
  const v = Number(n||0);
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);
}

async function api(path, options={}){
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers||{}) },
    ...options
  });
  const text = await res.text();
  let data;
  try{ data = text ? JSON.parse(text) : {} }catch{ data = { ok:false, error: 'Bad JSON from server', raw: text } }
  if(!res.ok){ const err = new Error(data.error || res.statusText); err.status = res.status; err.data = data; throw err; }
  return data;
}

function adminHeaders(){
  const secret = localStorage.getItem(ADMIN_KEY) || '';
  return secret ? { 'x-admin-secret': secret } : {};
}

function el(sel, root=document){ return root.querySelector(sel); }
function els(sel, root=document){ return [...root.querySelectorAll(sel)]; }
