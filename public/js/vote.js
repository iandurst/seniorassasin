async function checkWindow(){
  try{
    const s = await fetchJSON('/api/status');
    const el = document.getElementById('voteWindowInfo');
    const form = document.getElementById('voteForm');
    if(s.isSundayVoting){
      el.textContent = 'Voting is OPEN (CST).';
      form.classList.remove('hidden');
    }else{
      el.textContent = 'Voting opens on Sunday (CST).';
      form.classList.add('hidden');
    }
  }catch(e){
    // noop
  }
}

async function handleVote(e){
  e.preventDefault();
  const fd = new FormData(e.target);
  const payload = {
    phone: fd.get('phone').trim(),
    vote: fd.get('vote')
  };
  const msg = document.getElementById('voteMsg');
  try{
    const r = await fetchJSON('/api/votes', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    });
    msg.textContent = r.message || 'Vote recorded. Thank you!';
    e.target.reset();
    await checkWindow();
  }catch(err){
    msg.textContent = err.message || 'Error submitting vote.';
  }
}

document.addEventListener('DOMContentLoaded', ()=>{
  checkWindow();
  document.getElementById('voteForm').addEventListener('submit', handleVote);
});
