
// Admin Targets client (enhanced with Status and auto-refresh)
(function(){
  const authCheck = async () => {
    const token = sessionStorage.getItem('ADMIN_SESSION') || '';
    if(!token) return false;
    const res = await fetch('/.netlify/functions/admin-auth', { headers: { 'x-admin-secret': token }});
    return res.ok;
  };

  const targetsCard = document.getElementById('targetsCard');
  if (!targetsCard) return;

  const weekInput = document.getElementById('weekNum');
  const tableBody = document.querySelector('#targetsTable tbody');

  const startWeekBtn = document.getElementById('startWeek');
  const loadTargetsBtn = document.getElementById('loadTargets');
  const exportCsvBtn = document.getElementById('exportCsv');
  const copyAllBtn = document.getElementById('copyAll');

  function showTargetsCard(show){
    if (show) targetsCard.classList.remove('hidden');
    else targetsCard.classList.add('hidden');
  }

  async function onAuthChange(){
    showTargetsCard(await authCheck());
  }

  async function postJSON(url, body){
    const token = sessionStorage.getItem('ADMIN_SESSION') || '';
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type':'application/json', 'x-admin-secret': token },
      body: JSON.stringify(body || {})
    });
    const j = await res.json().catch(()=>({}));
    if(!res.ok) throw new Error(j.error || res.statusText);
    return j;
  }
  async function getJSON(url){
    const token = sessionStorage.getItem('ADMIN_SESSION') || '';
    const res = await fetch(url, { headers: { 'x-admin-secret': token } });
    const j = await res.json().catch(()=>({}));
    if(!res.ok) throw new Error(j.error || res.statusText);
    return j;
  }

  startWeekBtn?.addEventListener('click', async ()=>{
    try{
      const week = Number(weekInput.value || 1);
      if(week <= 0) return alert('Enter a valid week number');
      await postJSON('/.netlify/functions/admin-start-week', { week });
      await loadTargets();
      alert('Week started. Targets generated.');
    }catch(e){ alert(e.message); }
  });

  async function loadTargets(){
    const week = Number(weekInput.value || 1);
    const [pairs, statuses] = await Promise.all([
      getJSON('/.netlify/functions/admin-targets?week=' + encodeURIComponent(week)),
      getJSON('/.netlify/functions/admin-status?week=' + encodeURIComponent(week))
    ]);
    renderTargets((pairs.pairs || []), (statuses.status || {}), week);
  }
  loadTargetsBtn?.addEventListener('click', loadTargets);

  function renderTargets(pairs, statusMap, week){
    tableBody.innerHTML = '';
    pairs.forEach((row, i)=>{
      const msg = `your target is ${row.target.name || ''}`;
      const st = statusMap[row.hunter.phone] || 'Active';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${i+1}</td>
        <td>${escapeHtml(row.hunter.name || '')}</td>
        <td>${escapeHtml(row.hunter.phone || '')}</td>
        <td>${escapeHtml(row.target.name || '')}</td>
        <td>${escapeHtml(row.target.phone || '')}</td>
        <td>
          <select data-phone="${escapeHtml(row.hunter.phone || '')}" data-week="${week}">
            ${['Active','Eliminated','Immune'].map(opt => `<option value="${opt}" ${opt===st?'selected':''}>${opt}</option>`).join('')}
          </select>
        </td>
        <td><code>${escapeHtml(msg)}</code></td>
      `;
      tableBody.appendChild(tr);
    });

    // Attach change handlers
    tableBody.querySelectorAll('select[data-phone]').forEach(sel => {
      sel.addEventListener('change', async () => {
        const phone = sel.getAttribute('data-phone');
        const week = Number(sel.getAttribute('data-week') || 1);
        const status = sel.value;
        try{
          await postJSON('/.netlify/functions/admin-status', { week, phone, status });
        }catch(err){ alert(err.message); }
      });
    });
  }

  exportCsvBtn?.addEventListener('click', async ()=>{
    const rows = [...document.querySelectorAll('#targetsTable tbody tr')].map(tr => {
      const tds = tr.querySelectorAll('td');
      return {
        index: tds[0].textContent.trim(),
        participant_name: tds[1].textContent.trim(),
        participant_phone: tds[2].textContent.trim(),
        target_name: tds[3].textContent.trim(),
        target_phone: tds[4].textContent.trim(),
        status: tds[5].querySelector('select')?.value || 'Active',
        message: tds[6].innerText.replace(/^\s+|\s+$/g,'')
      };
    });
    const header = ['#','participant_name','participant_phone','target_name','target_phone','status','message'];
    const csv = [header.join(',')].concat(rows.map(r=>[r.index, r.participant_name, r.participant_phone, r.target_name, r.target_phone, r.status, r.message].map(v => `"${(v||'').replace(/"/g,'""')}"`).join(','))).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'targets_week_' + (weekInput.value || 'X') + '.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  copyAllBtn?.addEventListener('click', async ()=>{
    const lines = [...document.querySelectorAll('#targetsTable tbody tr')].map(tr => {
      const tds = tr.querySelectorAll('td');
      const phone = tds[2].textContent.trim();
      const target = tds[3].textContent.trim();
      return `${phone}: your target is ${target}`;
    });
    try{
      await navigator.clipboard.writeText(lines.join('\n'));
      alert('Copied all messages to clipboard.');
    }catch(e){
      alert('Copy failed. Use Export CSV as fallback.');
    }
  });

  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  // Auto-refresh every 10s while authenticated
  let refresher = null;
  async function startAuto(){
    await loadTargets();
    if (refresher) clearInterval(refresher);
    refresher = setInterval(loadTargets, 10000);
  }

  (async function init(){
    if (await authCheck()) {
      showTargetsCard(true);
      startAuto();
    } else {
      showTargetsCard(false);
    }
  })();

  window.addEventListener('storage', async (e)=>{
    if (e.key === 'ADMIN_SESSION') {
      if (await authCheck()) { showTargetsCard(true); startAuto(); }
      else { showTargetsCard(false); }
    }
  });
})();
