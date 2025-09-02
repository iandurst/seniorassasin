let ADMIN_TOKEN = localStorage.getItem('pcs_admin_token') || '';

function adminHeaders(){
  return ADMIN_TOKEN ? {'x-admin-password': ADMIN_TOKEN} : {};
}

async function adminFetchJSON(url, opts={}){
  const res = await fetch(url, {headers:{...adminHeaders(), ...(opts.headers||{})}, ...opts});
  if(!res.ok){
    throw new Error(await res.text());
  }
  return res.json();
}

async function adminLogin(){
  const pw = document.getElementById('adminPassword').value;
  const msg = document.getElementById('adminAuthMsg');
  try{
    await adminFetchJSON('/api/admin/ping', {headers:{'x-admin-password': pw}});
    ADMIN_TOKEN = pw;
    localStorage.setItem('pcs_admin_token', pw);
    document.getElementById('adminAuth').classList.add('hidden');
    document.getElementById('adminPanel').classList.remove('hidden');
    loadAdmin();
  }catch(e){
    msg.textContent = 'Incorrect password.';
  }
}

async function loadParticipants(){
  const data = await adminFetchJSON('/api/participants');
  const tbody = document.getElementById('participantsBody');
  tbody.innerHTML = '';
  data.participants.forEach(p => {
    const tr = document.createElement('tr');
    const name = `${p.FirstName} ${p.LastName}`;
    tr.innerHTML = `
      <td>${name}</td>
      <td>${p.Phone || ''}</td>
      <td>${p.Status}</td>
      <td>${p.Verified ? 'Yes' : 'No'}</td>
      <td>${p.Eliminations||0}</td>
      <td>
        <div class="btns">
          ${p.Verified ? '' : '<button class="btn" data-act="verify">Verify</button>'}
          ${p.Status !== 'Eliminated' ? '<button class="btn warning" data-act="eliminate">Eliminate</button>' : ''}
        </div>
        <div class="muted">ID: ${p.id}</div>
      </td>
    `;
    tr.querySelectorAll('button').forEach(b=>{
      b.addEventListener('click', async ()=>{
        try{
          if(b.dataset.act==='verify'){
            await adminFetchJSON('/api/verify', {
              method:'POST',
              headers:{'Content-Type':'application/json'},
              body: JSON.stringify({participantId: p.id, action:'verify'})
            });
          }else if(b.dataset.act==='eliminate'){
            // self-eliminate shortcut
            await adminFetchJSON('/api/elimination', {
              method:'POST',
              headers:{'Content-Type':'application/json'},
              body: JSON.stringify({eliminatorId: p.id, eliminatedId: p.id})
            });
          }
          await loadParticipants();
        }catch(e){ alert(e.message); }
      });
    });
    tbody.appendChild(tr);
  });
}

async function loadVotes(){
  const box = document.getElementById('votesBox');
  try{
    const v = await adminFetchJSON('/api/votes');
    const items = v.votes.map(x => `<div>Week ${x.WeekNumber} — <strong>${x.ParticipantName}</strong>: ${x.Vote}</div>`);
    box.innerHTML = items.join('') || '<div class="muted">No votes yet.</div>';
  }catch(e){
    box.textContent = 'Error loading votes.';
  }
}

async function loadAdmin(){
  await loadParticipants();
  await loadVotes();
}

async function startWeek(){
  try{
    await adminFetchJSON('/api/startWeek', {method:'POST'});
    await loadAdmin();
    alert('New week started.');
  }catch(e){ alert(e.message); }
}
async function resetWeek(){
  try{
    await adminFetchJSON('/api/resetWeek', {method:'POST'});
    await loadAdmin();
    alert('This week has been reset.');
  }catch(e){ alert(e.message); }
}
async function fullReset(){
  if(!confirm('This will reset ALL DATA. Are you sure?')) return;
  try{
    await adminFetchJSON('/api/fullReset', {method:'POST'});
    await loadAdmin();
    alert('Full reset completed.');
  }catch(e){ alert(e.message); }
}

async function recordElimination(e){
  e.preventDefault();
  const fd = new FormData(e.target);
  try{
    await adminFetchJSON('/api/elimination', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ 
        eliminatorId: fd.get('eliminatorId').trim(),
        eliminatedId: fd.get('eliminatedId').trim()
      })
    });
    document.getElementById('elimMsg').textContent = 'Elimination recorded.';
    e.target.reset();
    await loadAdmin();
  }catch(err){
    document.getElementById('elimMsg').textContent = err.message;
  }
}

document.addEventListener('DOMContentLoaded', ()=>{
  document.getElementById('adminLoginBtn').addEventListener('click', adminLogin);
  document.getElementById('startWeekBtn').addEventListener('click', startWeek);
  document.getElementById('resetWeekBtn').addEventListener('click', resetWeek);
  document.getElementById('fullResetBtn').addEventListener('click', fullReset);
  document.getElementById('elimForm').addEventListener('submit', recordElimination);

  // auto open if token stored
  if(ADMIN_TOKEN){
    adminLogin();
  }
});
