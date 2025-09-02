const { setSetting, getSettings, nowChicago, base } = require('./_airtable');
const requireAdmin = require('./_auth');

module.exports = async (req, res) => {
  if(!requireAdmin(req,res)) return;
  if(req.method !== 'POST'){
    res.statusCode = 405; res.end('Method Not Allowed'); return;
  }
  try{
    const settings = await getSettings().catch(()=>({}));
    const current = parseInt(settings.weekNumber || '0', 10);
    const next = (isNaN(current) ? 0 : current) + 1;
    await setSetting('weekNumber', String(next));
    await setSetting('weekStartISO', nowChicago().toISO());
    // clear votes for new week
    const votes = await base('Votes').select({}).all();
    if(votes.length){
      await base('Votes').destroy(votes.map(r=>r.id));
    }
    res.setHeader('Content-Type','application/json');
    res.end(JSON.stringify({ ok:true, weekNumber: next }));
  }catch(e){
    res.statusCode = 500; res.end('Error: ' + e.message);
  }
};
