
// admin-extra.js -- purge/reset controls (uses adminHeaders from common.js)
async function purgeStatus(){
  try{
    const s = await api('/purge-status');
    const st = el('#purgeStatus');
    const cd = el('#purgeCountdown');
    if(!st || !cd) return;
    if(s.active){
      st.textContent = 'Purge: ACTIVE';
      const ends = Date.parse(s.endsAt || 0);
      const now = Date.now();
      let left = Math.max(0, ends - now);
      const tick = () => {
        left = Math.max(0, ends - Date.now());
        const m = Math.floor(left/60000), sec = Math.floor((left%60000)/1000);
        cd.textContent = left > 0 ? `• Time left: ${m}m ${sec}s` : '• Ended';
        if(left <= 0) clearInterval(timer);
      };
      tick();
      var timer = setInterval(tick, 1000);
    }else{
      st.textContent = 'Purge: INACTIVE';
      cd.textContent = '';
    }
  }catch{}
}
async function startPurge(){
  if(!confirm('Start a 3‑hour purge and notify all players?')) return;
  try{
    const res = await api('/admin-purge', { method:'POST', headers: adminHeaders(), body: JSON.stringify({ action:'start' }) });
    alert('Purge started. Players notified: ' + (res.notified||0));
    purgeStatus();
  }catch(e){ alert(e.data?.error || 'Failed to start purge'); }
}
async function endPurge(){
  if(!confirm('End the purge now?')) return;
  try{
    await api('/admin-purge', { method:'POST', headers: adminHeaders(), body: JSON.stringify({ action:'end' }) });
    alert('Purge ended.');
    purgeStatus();
  }catch(e){ alert(e.data?.error || 'Failed to end purge'); }
}
async function resetAll(){
  if(!confirm('Really reset ALL data? This cannot be undone.')) return;
  try{
    await api('/admin-reset', { method:'POST', headers: adminHeaders() });
    alert('All data reset.');
  }catch(e){ alert(e.data?.error || 'Failed to reset'); }
}

document.addEventListener('DOMContentLoaded', () => {
  const sp = el('#startPurge');
  const ep = el('#endPurge');
  const ra = el('#resetAll');
  if(sp) sp.addEventListener('click', startPurge);
  if(ep) ep.addEventListener('click', endPurge);
  if(ra) ra.addEventListener('click', resetAll);
  purgeStatus();
});
