el('#signup').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const payload = Object.fromEntries(fd.entries());
  const btn = el('button[type="submit"]', e.target);
  btn.disabled = true; btn.textContent = 'Submitting...';
  try{
    const res = await api('/signup', { method:'POST', body: JSON.stringify(payload) });
    el('#result').innerHTML = `<div class="alert">Thanks for signing up!</div>`;
    e.target.reset();
  }catch(err){
    el('#result').innerHTML = `<div class="alert" style="background:rgba(255,107,107,.12)">${err.data?.error || 'Sign up failed.'}</div>`;
  }finally{
    btn.disabled = false; btn.textContent = 'Join the game';
  }
});
