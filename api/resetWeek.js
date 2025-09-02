const { base } = require('./_airtable');
const requireAdmin = require('./_auth');

module.exports = async (req, res) => {
  if(!requireAdmin(req,res)) return;
  if(req.method !== 'POST'){
    res.statusCode = 405; res.end('Method Not Allowed'); return;
  }
  try{
    // Remove this week's eliminations (keeps totals? We'll keep totals simple by deleting all elim records this week)
    // For simplicity, we clear ALL eliminations & votes for the week. 
    const elim = await base('Eliminations').select({}).all();
    if(elim.length){
      await base('Eliminations').destroy(elim.map(r=>r.id));
    }
    const votes = await base('Votes').select({}).all();
    if(votes.length){
      await base('Votes').destroy(votes.map(r=>r.id));
    }
    res.setHeader('Content-Type','application/json');
    res.end(JSON.stringify({ ok:true }));
  }catch(e){
    res.statusCode = 500; res.end('Error: ' + e.message);
  }
};
