(function(){
  const form = document.getElementById('signupForm');
  const status = document.getElementById('status');

  const setStatus = (msg, ok=true) => {
    status.textContent = msg;
    status.style.color = ok ? '#9fb3d1' : '#ff6b6b';
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const payload = { name: fd.get('name'), phone: fd.get('phone') };
    setStatus('Submitting…');
    try{
      const res = await fetch('/.netlify/functions/signup', {
        method: 'POST',
        headers: { 'content-type':'application/json' },
        body: JSON.stringify(payload)
      });
      const j = await res.json();
      if(!res.ok || !j.ok){ throw new Error(j.error || 'Signup failed'); }
      setStatus('Success! You will receive SMS updates. (You can reply STOP to opt out.)', true);
    }catch(err){
      setStatus('Error: ' + err.message, false);
    }
  });
})();