async function handleSignup(e){
  e.preventDefault();
  const fd = new FormData(e.target);
  const payload = {
    firstName: fd.get('firstName')?.trim(),
    lastName: fd.get('lastName')?.trim(),
    phone: fd.get('phone')?.trim(),
  };
  const msg = document.getElementById('signupMsg');
  try {
    await fetchJSON('/api/signup', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    });
    msg.textContent = 'Thanks! Submission received. You will be verified by an admin before entering the game.';
    e.target.reset();
  } catch(err){
    msg.textContent = 'Error: ' + err.message;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('signupForm').addEventListener('submit', handleSignup);
});
