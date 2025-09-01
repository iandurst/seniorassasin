
const API_BASE='/.netlify/functions';
function el(s,r=document){return r.querySelector(s)}
async function api(path,options={}){
  const res=await fetch(API_BASE+path,{headers:{'Content-Type':'application/json',...(options.headers||{})},...options});
  const text=await res.text(); let data;
  try{data=text?JSON.parse(text):{}}catch{data={ok:false,error:'Bad JSON',raw:text}}
  if(!res.ok){const e=new Error(data.error||res.statusText);e.status=res.status;e.data=data;throw e}
  return data;
}
function adminHeaders(){const s=localStorage.getItem('pcs_admin_secret')||'';return s?{'x-admin-secret':s}:{}}