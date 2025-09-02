
// Inject a site-wide purge banner that auto-updates using /.netlify/functions/purge-status
(function(){
  const POLL_MS = 5000; // refresh every 5s
  let timer = null, bar = null, space = null;

  function ensureBar(){
    if (bar) return bar;
    bar = document.createElement('div');
    bar.id = 'purge-banner';
    bar.style.position = 'fixed';
    bar.style.top = '0';
    bar.style.left = '0';
    bar.style.right = '0';
    bar.style.zIndex = '9999';
    bar.style.display = 'none';
    bar.style.padding = '10px 14px';
    bar.style.background = '#29141a';
    bar.style.borderBottom = '1px solid #6b1e32';
    bar.style.color = '#ffd9e4';
    bar.style.fontFamily = 'system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Helvetica Neue,Arial';
    bar.style.textAlign = 'center';
    bar.style.fontSize = '14px';
    bar.innerHTML = '<strong>🚨 Purge Active</strong> — <span id="purge-remaining"></span>';
    document.body.appendChild(bar);

    // spacer to prevent layout shift
    space = document.createElement('div');
    space.id = 'purge-banner-space';
    space.style.height = '0px';
    document.body.insertBefore(space, document.body.firstChild);
    return bar;
  }

  function showBar(){
    ensureBar();
    bar.style.display = 'block';
    space.style.height = bar.getBoundingClientRect().height + 'px';
  }

  function hideBar(){
    if (!bar) return;
    bar.style.display = 'none';
    space.style.height = '0px';
  }

  function fmt(ms){
    const s = Math.max(0, Math.floor(ms/1000));
    const m = Math.floor(s/60);
    const r = s % 60;
    return m + 'm ' + (r<10?'0':'') + r + 's';
  }

  async function tick(){
    try{
      const res = await fetch('/.netlify/functions/purge-status', { cache: 'no-store' });
      const j = await res.json();
      if (j.active) {
        showBar();
        const el = document.getElementById('purge-remaining');
        if (el) el.textContent = 'ends in ' + fmt(j.remainingMs);
      } else {
        hideBar();
      }
    }catch(e){
      // ignore
    }
  }

  function start(){
    tick();
    timer = setInterval(tick, POLL_MS);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
