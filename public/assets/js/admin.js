(function(){
  // Elements
  const loginForm = document.getElementById('loginForm');
  const loginStatus = document.getElementById('loginStatus');
  const authCard = document.getElementById('authCard');
  const controlsCard = document.getElementById('controlsCard');
  const startBtn = document.getElementById('startPurge');
  const endBtn = document.getElementById('endPurge');
  const resetBtn = document.getElementById('resetAll');
  const purgeStatusEl = document.getElementById('purgeStatus');
  const countdownEl = document.getElementById('countdown');
  const adminLog = document.getElementById('adminLog');
  const healthBtn = document.getElementById('checkTelnyx');
  const healthOut = document.getElementById('healthOut');

  let token = sessionStorage.getItem('ADMIN_SESSION') || '';

  function log(msg, obj){
    const time = new Date().toLocaleTimeString();
    adminLog.textContent += `\n[${time}] ${msg}` + (obj ? `\n${JSON.stringify(obj, null, 2)}\n` : '\n');
    adminLog.scrollTop = adminLog.scrollHeight;
  }

  async function authPing(secret){
    const res = await fetch('/.netlify/functions/admin-auth', { headers: { 'x-admin-secret': secret || token } });
    return res.ok;
  }

  function showControls(show){
    authCard.classList.toggle('hidden', show);
    controlsCard.classList.toggle('hidden', !show);
  }

  loginForm.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const fd = new FormData(loginForm);
    const secret = fd.get('password');
    loginStatus.textContent = 'Checking…';
    const ok = await authPing(secret);
    if(ok){
      token = secret;
      sessionStorage.setItem('ADMIN_SESSION', token);
      loginStatus.textContent = 'Authenticated.';
      showControls(true);
      refreshPurge();
    }else{
      loginStatus.textContent = 'Invalid password.';
      sessionStorage.removeItem('ADMIN_SESSION');
    }
  });

  async function postJSON(url, body){
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type':'application/json', 'x-admin-secret': token },
      body: JSON.stringify(body || {})
    });
    const j = await res.json().catch(()=>({}));
    if(!res.ok) throw new Error(j.error || res.statusText);
    return j;
  }

  async function refreshPurge(){
    try{
      const r = await fetch('/.netlify/functions/purge-status');
      const j = await r.json();
      if(j.active){
        purgeStatusEl.textContent = 'ACTIVE';
        startCountdown(j.endsAt);
      }else{
        purgeStatusEl.textContent = 'INACTIVE';
        stopCountdown();
      }
    }catch(e){
      purgeStatusEl.textContent = 'Error';
    }
  }

  let timer=null;
  function startCountdown(endsAtIso){
    stopCountdown();
    const ends = Date.parse(endsAtIso);
    timer = setInterval(()=>{
      const left = Math.max(0, ends - Date.now());
      const m = Math.floor(left/60000);
      const s = Math.floor((left%60000)/1000);
      countdownEl.textContent = left>0 ? `Time left: ${m}m ${s}s` : 'Purge ended';
      if(left<=0) stopCountdown();
    },1000);
  }
  function stopCountdown(){ if(timer){ clearInterval(timer); timer=null; } countdownEl.textContent=''; }

  startBtn.addEventListener('click', async ()=>{
    if(!token) return alert('Please login first.');
    if(!confirm('Start a 3‑hour purge and notify all players by SMS?')) return;
    try{
      const j = await postJSON('/.netlify/functions/admin-purge', { action: 'start' });
      log('Purge started', j);
      refreshPurge();
    }catch(e){ alert(e.message); }
  });

  endBtn.addEventListener('click', async ()=>{
    if(!token) return alert('Please login first.');
    if(!confirm('End purge now?')) return;
    try{
      const j = await postJSON('/.netlify/functions/admin-purge', { action: 'end' });
      log('Purge ended', j);
      refreshPurge();
    }catch(e){ alert(e.message); }
  });

  resetBtn.addEventListener('click', async ()=>{
    if(!token) return alert('Please login first.');
    if(!confirm('Really reset ALL data? This cannot be undone.')) return;
    try{
      const j = await postJSON('/.netlify/functions/admin-reset', {});
      log('Reset done', j);
    }catch(e){ alert(e.message); }
  });

  healthBtn.addEventListener('click', async ()=>{
    const r = await fetch('/.netlify/functions/telnyx-health');
    const j = await r.json().catch(()=>({}));
    healthOut.textContent = JSON.stringify(j, null, 2);
  });

  // Auto-restore session
  (async function init(){
    if(token && await authPing()){
      showControls(true);
      refreshPurge();
    } else {
      showControls(false);
    }
  })();
})();