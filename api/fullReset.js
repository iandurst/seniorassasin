const { base, setSetting } = require('./_airtable');
const requireAdmin = require('./_auth');

module.exports = async (req, res) => {
  if(!requireAdmin(req,res)) return;
  if(req.method !== 'POST'){
    res.statusCode = 405; res.end('Method Not Allowed'); return;
  }
  try{
    // Clear votes
    const votes = await base('Votes').select({}).all();
    if(votes.length) await base('Votes').destroy(votes.map(r=>r.id));
    // Clear eliminations
    const elim = await base('Eliminations').select({}).all();
    if(elim.length) await base('Eliminations').destroy(elim.map(r=>r.id));
    // Reset participants
    const parts = await base('Participants').select({}).all();
    for(const p of parts){
      await base('Participants').update(p.id, { Verified: false, Status: 'Pending', Eliminations: 0, Alive: true, WeekEliminated: null });
    }
    // Reset settings
    await setSetting('basePrize', '0');
    await setSetting('weekNumber', '1');
    res.setHeader('Content-Type','application/json');
    res.end(JSON.stringify({ ok:true }));
  }catch(e){
    res.statusCode = 500; res.end('Error: ' + e.message);
  }
};
