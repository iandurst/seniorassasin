async function loadHome(){
  // Prize pool
  try {
    const pp = await fetchJSON('/api/prizepool');
    document.getElementById('prizePool').textContent = formatMoney(pp.prizePool);
    document.querySelector('.muted').textContent = `+$${pp.prizePerElimination} for every elimination`;
  } catch(e){ /* noop */ }

  // Leaderboard
  try {
    const lb = await fetchJSON('/api/leaderboard');
    const tbody = document.getElementById('leaderboardBody');
    tbody.innerHTML = '';
    lb.leaderboard.forEach((p, i)=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${i+1}</td>
        <td>${p.FirstName} ${p.LastName}</td>
        <td>${p.Status}</td>
        <td>${p.Eliminations}</td>
      `;
      tbody.appendChild(tr);
    });
    // Top eliminator
    const top = lb.leaderboard[0];
    const topEl = document.getElementById('topEliminator');
    if(top){
      const tied = lb.leaderboard.filter(x => x.Eliminations === top.Eliminations).length > 1;
      topEl.textContent = tied ? `${top.FirstName} ${top.LastName} (tied at ${top.Eliminations})` :
                                 `${top.FirstName} ${top.LastName} — ${top.Eliminations}`;
    } else {
      topEl.textContent = 'No data yet';
    }
  } catch(e){
    // ignore
  }
}

document.addEventListener('DOMContentLoaded', loadHome);
