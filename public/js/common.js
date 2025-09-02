// Common site helpers
const PRIZE_PER_ELIMINATION = 5; // display only; actual calc on server

async function fetchJSON(url, opts={}){
  const res = await fetch(url, { credentials:'same-origin', ...opts });
  if(!res.ok){
    const t = await res.text();
    throw new Error(t || res.statusText);
  }
  return res.json();
}

function formatMoney(n){ return `$${Number(n||0).toLocaleString()}`; }

function setBanner(text){
  const el = document.getElementById('globalBanner');
  if(!el) return;
  if(text){
    el.textContent = text;
    el.classList.remove('hidden');
  }else{
    el.textContent = '';
    el.classList.add('hidden');
  }
}

async function initBanner(){
  try {
    const s = await fetchJSON('/api/status');
    if(s.isPurgeActive){
      setBanner('PURGE DAY ACTIVE — Anyone may eliminate anyone until midnight CST.');
    } else if (s.isSundayVoting){
      setBanner('SUNDAY VOTING — Cast your vote to continue or end the game.');
    } else {
      setBanner('');
    }
  } catch(e){
    // ignore
  }
}

document.addEventListener('DOMContentLoaded', initBanner);
