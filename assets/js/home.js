(async function(){
  try{
    const state = await api('/get-state');
    const { leaderboard, prizePool, participants, settings } = state;
    const top = leaderboard[0];
    el('#prize').textContent = currency(prizePool);
    el('#count').textContent = String(participants.filter(p=>p.status==='active').length);
    el('#week').textContent = String(settings.week || 0);
    if(top){
      el('#topName').textContent = `${top.firstName} ${top.lastName}`;
      el('#topKills').textContent = `${top.eliminations} eliminations`;
    }else{
      el('#topName').textContent = '—';
      el('#topKills').textContent = 'No eliminations yet';
    }
    const tbody = el('#board');
    tbody.innerHTML = '';
    leaderboard.slice(0,10).forEach((p) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${p.firstName} ${p.lastName}</td><td>${p.eliminations}</td><td><span class="badge ${p.alive?'alive':'out'}">${p.alive?'Alive':'Out'}</span></td>`;
      tbody.appendChild(tr);
    });
  }catch(err){
    console.error(err);
    el('#error').textContent = 'Could not load live stats. Try again later.';
  }
})();
