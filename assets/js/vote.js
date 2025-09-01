(function(){
  function getParam(name){
    const url = new URL(location.href);
    return url.searchParams.get(name);
  }

  async function refresh(){
    try{
      const st = await api('/get-vote');
      const vs = el('#voteStatus');
      if(st.status === 'open'){
        const now = Date.now();
        const ends = Date.parse(st.endAt);
        const remaining = Math.max(0, Math.floor((ends-now)/1000));
        const mins = Math.floor(remaining/60);
        const secs = remaining%60;
        vs.textContent = `Voting is OPEN. Ends in ${mins}m ${secs}s.`;
        el('#voteForm').style.display = 'block';
      }else if(st.status === 'closed'){
        vs.textContent = `Voting is closed. Result: ${st.result?.stopped ? 'STOP' : 'CONTINUE'} (${st.counts.stop} stop / ${st.counts.continue} continue)`;
        el('#voteForm').style.display = 'none';
      }else{
        vs.textContent = 'No active vote.';
        el('#voteForm').style.display = 'none';
      }
    }catch(e){
      el('#voteStatus').textContent = 'Could not load vote status.';
    }
  }

  const token = (getParam('token')||'').trim();
  if(token){ el('#voteToken').value = token; }
  refresh();
  setInterval(refresh, 5000);

  async function cast(choice){
    const tok = el('#voteToken').value.trim();
    if(!tok){ alert('Missing vote token. Open this link from your text message.'); return; }
    try{
      const res = await api('/cast-vote', { method:'POST', body: JSON.stringify({ token: tok, choice }) });
      el('#voteResult').innerHTML = `<div class="alert">Vote recorded: <strong>${choice.toUpperCase()}</strong></div>`;
      await refresh();
    }catch(err){
      el('#voteResult').innerHTML = `<div class="alert" style="background:rgba(255,107,107,.12)">${err.data?.error || 'Vote failed'}</div>`;
    }
  }

  el('#btnStop').addEventListener('click', () => cast('stop'));
  el('#btnContinue').addEventListener('click', () => cast('continue'));
})();
