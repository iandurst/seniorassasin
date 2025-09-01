const loginForm = el('#loginForm');
const adminPanel = el('#adminPanel');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const secret = el('#secret').value.trim();
  localStorage.setItem(ADMIN_KEY, secret);
  try{
    await api('/verify-admin', { method:'POST', headers: adminHeaders() });
    loginForm.style.display = 'none';
    adminPanel.style.display = 'block';
    await loadState();
  }catch(err){
    localStorage.removeItem(ADMIN_KEY);
    alert('Incorrect password.');
  }
});

async function loadState(){
  const state = await api('/get-state');
  const { participants, settings } = state;
  // counts
  el('#totals').textContent = `${participants.filter(p=>p.alive).length} alive / ${participants.length} total`;

  // leaderboard
  const tbody = el('#adminList');
  tbody.innerHTML = '';
  participants.sort((a,b)=> a.lastName.localeCompare(b.lastName)).forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${p.firstName} ${p.lastName}</td>
      <td>${p.eliminations}</td>
      <td>
        <select data-id="${p.id}" class="statusSel">
          <option value="true" ${p.alive?'selected':''}>Alive</option>
          <option value="false" ${!p.alive?'selected':''}>Out</option>
        </select>
      </td>
    `;
    tbody.appendChild(tr);
  });

  els('.statusSel').forEach(sel => {
    sel.addEventListener('change', async (e) => {
      const id = e.target.getAttribute('data-id');
      const alive = e.target.value === 'true';
      try{
        await api('/update-participant', {
          method: 'POST',
          headers: adminHeaders(),
          body: JSON.stringify({ id, alive })
        });
      }catch(err){
        alert(err.data?.error || 'Update failed');
      }
    });
  });

  el('#entryFee').value = settings.entryFee || '';
  el('#prizeOverride').value = settings.prizePoolOverride ?? '';
}

el('#refresh').addEventListener('click', loadState);

el('#saveSettings').addEventListener('click', async () => {
  const entryFee = Number(el('#entryFee').value || 0);
  const prizePoolOverride = el('#prizeOverride').value === '' ? null : Number(el('#prizeOverride').value);
  try{
    await api('/set-settings', {
      method:'POST',
      headers: adminHeaders(),
      body: JSON.stringify({ entryFee, prizePoolOverride })
    });
    await loadState();
    alert('Settings saved.');
  }catch(err){
    alert(err.data?.error || 'Failed to save settings');
  }
});

el('#reportBtn').addEventListener('click', async () => {
  const killerId = el('#killer').value;
  const targetId = el('#target').value;
  if(!killerId || !targetId || killerId === targetId){ alert('Pick two different people.'); return; }
  try{
    await api('/report-elimination', {
      method:'POST',
      headers: adminHeaders(),
      body: JSON.stringify({ killerId, targetId })
    });
    await loadState();
    alert('Elimination recorded.');
  }catch(err){
    alert(err.data?.error || 'Could not record elimination');
  }
});

el('#startWeek').addEventListener('click', async () => {
  if(!confirm('Start a new week and text targets to all alive players?')) return;
  try{
    const res = await api('/start-week', { method:'POST', headers: adminHeaders() });
    const list = res.assignments.map(a => `${a.hunterName} → ${a.targetName}`).join('\n');
    alert(`Week ${res.week} started!\n\nAssignments:\n${list}`);
    await loadState();
  }catch(err){
    alert(err.data?.error || 'Failed to start week');
  }
});

// Populate dropdowns for elimination reporting when admin opens panel
const observer = new MutationObserver(() => {
  api('/get-state').then(({ participants }) => {
    const alive = participants.filter(p => p.alive);
    const opts = alive.map(p => `<option value="${p.id}">${p.firstName} ${p.lastName}</option>`).join('');
    el('#killer').innerHTML = `<option value="">-- select --</option>` + opts;
    el('#target').innerHTML = `<option value="">-- select --</option>` + opts;
  });
});
observer.observe(adminPanel, { attributes:true, attributeFilter:['style'] });
