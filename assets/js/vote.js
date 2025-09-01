async function loadVote(){
  try{
    const data = await api('/vote?mode=state');
    const s = data.state;
    if(!s.open){
      el('#voteStatus').textContent = 'Voting is currently closed. Voting runs on Fridays from 3:00–6:00 PM Central Time when the game is active.';
      el('#voteFormWrap').style.display = 'none';
      return;
    }
    const end = new Date(s.closesAt);
    const now = new Date();
    const minutesLeft = Math.max(0, Math.floor((end - now) / 60000));
    el('#voteStatus').textContent = `Voting is OPEN for Week ${s.week}. It closes in about ${minutesLeft} minute(s).`;
    el('#voteFormWrap').style.display = 'block';
  }catch(err){
    el('#voteStatus').textContent = 'Could not fetch vote status.';
  }
}

el('#voteForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const payload = Object.fromEntries(fd.entries());
  const btn = el('button[type="submit"]', e.target);
  btn.disabled = true; btn.textContent = 'Submitting…';
  try{
    const res = await api('/vote', { method:'POST', body: JSON.stringify(payload) });
    el('#voteMsg').innerHTML = '<div class="alert">Your vote has been recorded. Thank you!</div>';
    e.target.reset();
  }catch(err){
    el('#voteMsg').innerHTML = `<div class="alert" style="background:rgba(255,107,107,.12)">${err.data?.error || 'Vote failed.'}</div>`;
  }finally{
    btn.disabled = false; btn.textContent = 'Submit vote';
  }
});

loadVote();
