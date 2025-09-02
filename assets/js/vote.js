(async function(){
  const statusBox = el('#status');
  const form = el('#voteForm');
  const resultBox = el('#voteResult');
  const choiceInputs = els('input[name="choice"]');

  async function refresh(){
    try{
      const s = await api('/vote-status');
      if(s.gameEnded){
        statusBox.innerHTML = '<div class="alert">The game has ended.</div>';
        form.style.display = 'none';
        return;
      }
      if(!s.open){
        statusBox.innerHTML = '<div class="alert">Voting opens Fridays 3–6 pm Central (if a week is in progress).</div>';
        form.style.display = 'none';
      }else{
        statusBox.innerHTML = '<div class="alert">Voting is OPEN until 6:00 pm Central.</div>';
        form.style.display = 'grid';
      }
    }catch(err){
      statusBox.textContent = 'Unable to load voting status.';
      form.style.display = 'none';
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const payload = Object.fromEntries(fd.entries());
    if(!payload.phone || !payload.choice){
      resultBox.innerHTML = '<div class="alert" style="background:rgba(255,107,107,.12)">Enter your phone and pick an option.</div>';
      return;
    }
    const btn = el('button[type="submit"]', form);
    btn.disabled = true; btn.textContent = 'Submitting...';
    try{
      const res = await api('/cast-vote', { method:'POST', body: JSON.stringify(payload) });
      if(res.alreadyVoted){
        resultBox.innerHTML = '<div class="alert">Your vote was already recorded for this window.</div>';
      }else{
        resultBox.innerHTML = '<div class="alert">Thanks — your vote has been recorded.</div>';
      }
      if(res.gameEnded){
        statusBox.innerHTML = '<div class="alert"><strong>Result:</strong> 75% voted to stop — the game has ended.</div>';
        form.style.display = 'none';
      }
    }catch(err){
      resultBox.innerHTML = `<div class="alert" style="background:rgba(255,107,107,.12)">${err.data?.error || 'Vote failed.'}</div>`;
    }finally{
      btn.disabled = false; btn.textContent = 'Submit vote';
    }
  });

  await refresh();
})();
